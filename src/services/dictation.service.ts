import * as FileSystem from 'expo-file-system/legacy';

import { getAnalyzeUrl, getClientApiKey } from '@/src/services/ai/openai';

type TranscribeInspectorNoteInput = {
  localUri: string;
};

function getMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.3gp')) return 'audio/3gpp';
  if (lower.endsWith('.webm')) return 'audio/webm';
  if (lower.endsWith('.mp4')) return 'audio/mp4';
  if (lower.endsWith('.m4a')) return 'audio/m4a';
  return 'audio/m4a';
}

function getFilename(uri: string): string {
  const name = uri.split('/').pop()?.split('?')[0];
  return name && name.includes('.') ? name : 'inspector-note.m4a';
}

function resolveTranscribeEndpoint(baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '');
  if (base.endsWith('/transcribe-inspector-note')) return base;
  if (base.endsWith('/analyze-situation')) {
    return `${base.slice(0, -'/analyze-situation'.length)}/transcribe-inspector-note`;
  }
  if (base.endsWith('/api/analyze-situation')) {
    return `${base.slice(0, -'/api/analyze-situation'.length)}/api/transcribe-inspector-note`;
  }
  if (base.endsWith('/api')) return `${base}/transcribe-inspector-note`;
  return `${base}/api/transcribe-inspector-note`;
}

async function transcribeViaOpenAiDirect(localUri: string): Promise<string> {
  const apiKey = getClientApiKey();
  if (!apiKey) throw new Error('STT_PROVIDER_NOT_READY');

  let upload: FileSystem.FileSystemUploadResult;
  try {
    upload = await FileSystem.uploadAsync(
      'https://api.openai.com/v1/audio/transcriptions',
      localUri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        mimeType: getMimeType(localUri),
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        parameters: {
          model: 'gpt-4o-mini-transcribe',
          language: 'pt',
          response_format: 'json',
          prompt:
            'Contexto falado por inspetor de SST no Brasil antes de analisar foto de ambiente de trabalho.',
        },
      },
    );
  } catch {
    throw new Error('STT_NETWORK_ERROR');
  }

  const raw = upload.body ?? '';
  let payload: unknown = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }

  if (upload.status < 200 || upload.status >= 300) {
    const code =
      payload &&
      typeof payload === 'object' &&
      typeof (payload as { error?: { code?: string } }).error?.code === 'string'
        ? (payload as { error: { code: string } }).error.code
        : 'STT_UPSTREAM_ERROR';
    if (code === 'insufficient_quota') throw new Error('AI_QUOTA_EXCEEDED');
    throw new Error(code.startsWith('AI_') || code.startsWith('STT_') ? code : 'STT_UPSTREAM_ERROR');
  }

  const text =
    payload &&
    typeof payload === 'object' &&
    typeof (payload as { text?: string }).text === 'string'
      ? (payload as { text: string }).text.trim()
      : '';
  if (!text) throw new Error('STT_EMPTY_RESPONSE');
  return text;
}

export async function transcribeInspectorNote({
  localUri,
}: TranscribeInspectorNoteInput): Promise<string> {
  const endpoint = getAnalyzeUrl();
  if (!endpoint) {
    return transcribeViaOpenAiDirect(localUri);
  }

  const audioBase64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  let res: Response;
  try {
    res = await fetch(resolveTranscribeEndpoint(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64,
        mimeType: getMimeType(localUri),
        filename: getFilename(localUri),
      }),
    });
  } catch {
    throw new Error('STT_NETWORK_ERROR');
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
        : 'STT_UPSTREAM_ERROR';
    throw new Error(code);
  }

  const text =
    payload &&
    typeof payload === 'object' &&
    typeof (payload as { text?: string }).text === 'string'
      ? (payload as { text: string }).text.trim()
      : '';

  if (!text) throw new Error('STT_EMPTY_RESPONSE');
  return text;
}
