import { getAnalyzeUrl, getClientApiKey } from '@/src/services/ai/openai';

type AskAnalysisQuestionInput = {
  question: string;
};

function resolveAskEndpoint(endpoint: string): string {
  const base = endpoint.replace(/\/$/, '');
  if (base.endsWith('/ask-analysis-question')) return base;
  if (base.endsWith('/analyze-situation')) {
    return `${base.slice(0, -'/analyze-situation'.length)}/ask-analysis-question`;
  }
  if (base.endsWith('/api/analyze-situation')) {
    return `${base.slice(0, -'/api/analyze-situation'.length)}/api/ask-analysis-question`;
  }
  if (base.endsWith('/api')) return `${base}/ask-analysis-question`;
  return `${base}/api/ask-analysis-question`;
}

async function askViaOpenAiDirect(question: string): Promise<string> {
  const apiKey = getClientApiKey();
  if (!apiKey) throw new Error('AI_PROVIDER_NOT_READY');

  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
  } catch {
    throw new Error('AI_NETWORK_ERROR');
  }

  const raw = await res.text();
  if (!res.ok) throw new Error('AI_UPSTREAM_ERROR');

  const parsed = JSON.parse(raw) as { choices?: Array<{ message?: { content?: string } }> };
  const answer = parsed.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error('AI_EMPTY_RESPONSE');
  return answer;
}

export async function askAnalysisQuestion({
  question,
}: AskAnalysisQuestionInput): Promise<string> {
  const trimmed = question.trim();
  if (!trimmed) throw new Error('AI_BAD_REQUEST');

  const endpoint = getAnalyzeUrl();
  if (!endpoint) return askViaOpenAiDirect(trimmed);

  let res: Response;
  try {
    res = await fetch(resolveAskEndpoint(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: trimmed }),
    });
  } catch {
    throw new Error('AI_NETWORK_ERROR');
  }

  const raw = await res.text();
  let payload: unknown = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }

  if (!res.ok) {
    const code =
      payload &&
      typeof payload === 'object' &&
      typeof (payload as { error?: string }).error === 'string'
        ? (payload as { error: string }).error
        : 'AI_UPSTREAM_ERROR';
    throw new Error(code);
  }

  const answer =
    payload &&
    typeof payload === 'object' &&
    typeof (payload as { answer?: string }).answer === 'string'
      ? (payload as { answer: string }).answer.trim()
      : '';
  if (!answer) throw new Error('AI_EMPTY_RESPONSE');
  return answer;
}
