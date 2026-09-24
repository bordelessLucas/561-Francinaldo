import type { Config, Context } from '@netlify/functions';

type Body = {
  question?: string;
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

  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question) {
    return json(400, { error: 'AI_BAD_REQUEST' });
  }

  let openAiRes: Response;
  try {
    openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_ASSISTANT_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 700,
        messages: [
          {
            role: 'system',
            content:
              'Você é um especialista de SST no Brasil. Responda dúvidas antes de uma inspeção por foto. Seja objetivo, cite NRs prováveis quando útil e explique o que fotografar/verificar em campo.',
          },
          { role: 'user', content: question },
        ],
      }),
    });
  } catch (err) {
    console.error('OpenAI assistant network error', err);
    return json(502, { error: 'AI_UPSTREAM_ERROR' });
  }

  const raw = await openAiRes.text();
  if (!openAiRes.ok) {
    console.error('OpenAI assistant error', openAiRes.status, raw.slice(0, 500));
    let code = 'AI_UPSTREAM_ERROR';
    try {
      const parsed = JSON.parse(raw) as {
        error?: { code?: string; type?: string; message?: string };
      };
      const errCode = parsed.error?.code ?? '';
      const errType = parsed.error?.type ?? '';
      const msg = (parsed.error?.message ?? '').toLowerCase();
      if (openAiRes.status === 401 || openAiRes.status === 403) code = 'AI_AUTH_FAILED';
      else if (
        openAiRes.status === 429 ||
        errCode === 'insufficient_quota' ||
        errType === 'insufficient_quota' ||
        msg.includes('credit') ||
        msg.includes('quota')
      ) {
        code = 'AI_QUOTA_EXCEEDED';
      }
    } catch {
      // keep upstream
    }
    return json(openAiRes.status === 429 ? 402 : 502, { error: code });
  }

  try {
    const parsed = JSON.parse(raw) as { choices?: Array<{ message?: { content?: string } }> };
    const answer = parsed.choices?.[0]?.message?.content?.trim();
    if (!answer) return json(502, { error: 'AI_EMPTY_RESPONSE' });
    return json(200, { answer });
  } catch {
    return json(502, { error: 'AI_INVALID_RESPONSE' });
  }
};

export const config: Config = {
  path: '/api/ask-analysis-question',
};
