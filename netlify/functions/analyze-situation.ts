import type { Config, Context } from '@netlify/functions';

import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisUserText,
} from './_shared/analysis-prompt';
import { extractJsonObject, parseAnalysisPayload } from './_shared/parse-analysis';
import {
  formatNrContextForPrompt,
  retrieveNrContext,
} from './_shared/retrieve-nr-context';

type Body = {
  imageBase64?: string;
  mimeType?: string;
  model?: string;
  inspectorNote?: string;
  generateReport?: boolean;
};

function json(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function getOpenAiKey(): string | undefined {
  try {
    // Netlify runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const netlifyEnv = (globalThis as any).Netlify?.env?.get?.(
      'OPENAI_API_KEY',
    ) as string | undefined;
    if (netlifyEnv) return netlifyEnv;
  } catch {
    // ignore
  }
  return process.env.OPENAI_API_KEY;
}

/**
 * POST /api/analyze-situation
 * Body: { imageBase64, mimeType?, model?, inspectorNote? }
 * A imagem é usada só nesta request — não armazenada.
 */
export default async (req: Request, _context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return json(405, { error: 'METHOD_NOT_ALLOWED' });
  }

  const apiKey = getOpenAiKey();
  if (!apiKey) {
    return json(503, {
      error: 'AI_PROVIDER_NOT_READY',
      message: 'OPENAI_API_KEY ausente no servidor.',
    });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json(400, { error: 'AI_BAD_REQUEST' });
  }

  const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : '';
  if (!imageBase64 || imageBase64.length < 32) {
    return json(400, { error: 'AI_MISSING_IMAGE' });
  }

  const mimeType =
    typeof body.mimeType === 'string' && body.mimeType.startsWith('image/')
      ? body.mimeType
      : 'image/jpeg';
  const model =
    (typeof body.model === 'string' && body.model.trim()) ||
    process.env.OPENAI_MODEL ||
    'gpt-4o-mini';
  const inspectorNote =
    typeof body.inspectorNote === 'string' ? body.inspectorNote.trim() : '';
  const generateReport = body.generateReport === true;

  const dataUrl = `data:${mimeType};base64,${imageBase64}`;
  const retrievalContext = retrieveNrContext({
    inspectorNote: inspectorNote || undefined,
    maxItems: 8,
  });
  const nrContextText = formatNrContextForPrompt(retrievalContext);
  const userText = `${buildAnalysisUserText(inspectorNote || undefined, generateReport)}

Contexto normativo recuperado da base NR (use apenas quando fizer sentido para a cena; nao force enquadramento):
${nrContextText || '- Nenhum contexto especifico recuperado.'}`;

  let openAiRes: Response;
  try {
    openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 1600,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    console.error('OpenAI network error', err);
    return json(502, { error: 'AI_UPSTREAM_ERROR' });
  }

  if (!openAiRes.ok) {
    const errText = await openAiRes.text();
    console.error('OpenAI error', openAiRes.status, errText.slice(0, 500));
    let code = 'AI_UPSTREAM_ERROR';
    try {
      const parsed = JSON.parse(errText) as {
        error?: { code?: string; type?: string; message?: string };
      };
      const errCode = parsed.error?.code ?? '';
      const errType = parsed.error?.type ?? '';
      const msg = (parsed.error?.message ?? '').toLowerCase();
      if (openAiRes.status === 401 || openAiRes.status === 403) code = 'AI_AUTH_FAILED';
      else if (
        openAiRes.status === 429 ||
        errCode === 'insufficient_quota' ||
        errCode === 'credit_balance_exhausted' ||
        errType === 'insufficient_quota' ||
        msg.includes('credit') ||
        msg.includes('quota')
      ) {
        code = 'AI_QUOTA_EXCEEDED';
      } else if (openAiRes.status === 400) {
        code = 'AI_BAD_IMAGE';
      }
    } catch {
      // keep upstream
    }
    return json(openAiRes.status === 429 ? 402 : 502, {
      error: code,
      status: openAiRes.status,
    });
  }

  const completion = (await openAiRes.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    return json(502, { error: 'AI_EMPTY_RESPONSE' });
  }

  try {
    const parsed = parseAnalysisPayload(extractJsonObject(content));
    return json(200, {
      ...parsed,
      retrievalContext:
        parsed.retrievalContext && parsed.retrievalContext.length > 0
          ? parsed.retrievalContext
          : retrievalContext,
      provider: 'openai',
      model,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Parse analysis failed', err);
    const code =
      err instanceof Error && err.message.startsWith('AI_')
        ? err.message
        : 'AI_INVALID_PAYLOAD';
    return json(502, { error: code });
  }
};

export const config: Config = {
  path: '/api/analyze-situation',
};
