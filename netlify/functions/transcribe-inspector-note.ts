import type { Config, Context } from '@netlify/functions';

type Body = {
  audioBase64?: string;
  mimeType?: string;
  filename?: string;
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

function toArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
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
    return json(400, { error: 'STT_BAD_REQUEST' });
  }

  const audioBase64 = typeof body.audioBase64 === 'string' ? body.audioBase64.trim() : '';
  if (!audioBase64 || audioBase64.length < 32) {
    return json(400, { error: 'STT_MISSING_AUDIO' });
  }

  const mimeType =
    typeof body.mimeType === 'string' && body.mimeType.startsWith('audio/')
      ? body.mimeType
      : 'audio/m4a';
  const filename =
    typeof body.filename === 'string' && body.filename.trim()
      ? body.filename.trim()
      : 'inspector-note.m4a';

  const form = new FormData();
  form.append('model', process.env.OPENAI_STT_MODEL || 'gpt-4o-mini-transcribe');
  form.append('response_format', 'json');
  form.append('language', 'pt');
  form.append(
    'prompt',
    'Contexto falado por inspetor de SST no Brasil antes de analisar foto de ambiente de trabalho.',
  );
  form.append('file', new Blob([toArrayBuffer(audioBase64)], { type: mimeType }), filename);

  let openAiRes: Response;
  try {
    openAiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });
  } catch (err) {
    console.error('OpenAI STT network error', err);
    return json(502, { error: 'STT_UPSTREAM_ERROR' });
  }

  const raw = await openAiRes.text();
  if (!openAiRes.ok) {
    console.error('OpenAI STT error', openAiRes.status, raw.slice(0, 500));
    let code = 'STT_UPSTREAM_ERROR';
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
      } else if (openAiRes.status === 400) {
        code = 'STT_BAD_AUDIO';
      }
    } catch {
      // keep upstream
    }
    return json(openAiRes.status === 429 ? 402 : 502, {
      error: code,
      status: openAiRes.status,
    });
  }

  try {
    const parsed = JSON.parse(raw) as { text?: string };
    const text = typeof parsed.text === 'string' ? parsed.text.trim() : '';
    if (!text) return json(502, { error: 'STT_EMPTY_RESPONSE' });
    return json(200, { text });
  } catch {
    return json(502, { error: 'STT_INVALID_RESPONSE' });
  }
};

export const config: Config = {
  path: '/api/transcribe-inspector-note',
};

