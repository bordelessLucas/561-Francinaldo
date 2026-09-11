import type { AnalysisRecord, AnalysisResult, AnalysisSource } from '@/lib/types';
import { runAnalysisWithoutUpload } from '@/src/services/analysis.service';

export type AnalysisQueueItemStatus = 'queued' | 'analyzing' | 'done' | 'failed';

export type AnalysisQueueItem = {
  id: string;
  localUri: string;
  source: AnalysisSource;
  status: AnalysisQueueItemStatus;
  analysisId?: string;
  result?: AnalysisResult;
  errorMessage?: string;
};

export type RunAnalysisQueueInput = {
  uid: string;
  items: Array<{ localUri: string; source: AnalysisSource }>;
  inspectorNote?: string;
  /** Retorne false para parar antes do próximo item (cancelamento da UI). */
  shouldContinue?: () => boolean;
  onProgress?: (snapshot: {
    index: number;
    total: number;
    current: AnalysisQueueItem;
    items: AnalysisQueueItem[];
  }) => void;
};

function makeId(index: number): string {
  return `q-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Processa fotos em fila sequencial (1 Vision call por vez).
 * Para o usuário parece um lote; na API o consumo é controlado.
 */
export async function runAnalysisQueue(
  input: RunAnalysisQueueInput,
): Promise<AnalysisQueueItem[]> {
  const total = input.items.length;
  if (total === 0) {
    throw new Error('AI_MISSING_IMAGE');
  }

  const queue: AnalysisQueueItem[] = input.items.map((item, index) => ({
    id: makeId(index),
    localUri: item.localUri,
    source: item.source,
    status: 'queued',
  }));

  for (let index = 0; index < queue.length; index += 1) {
    if (input.shouldContinue && !input.shouldContinue()) {
      break;
    }

    const current = queue[index];
    current.status = 'analyzing';
    input.onProgress?.({
      index,
      total,
      current: { ...current },
      items: queue.map((item) => ({ ...item })),
    });

    try {
      const record: AnalysisRecord = await runAnalysisWithoutUpload({
        uid: input.uid,
        localUri: current.localUri,
        source: current.source,
        inspectorNote: input.inspectorNote,
      });

      if (input.shouldContinue && !input.shouldContinue()) {
        break;
      }

      current.status = 'done';
      current.analysisId = record.id;
      current.result = record.result;
    } catch (error) {
      if (input.shouldContinue && !input.shouldContinue()) {
        break;
      }
      current.status = 'failed';
      current.errorMessage =
        error instanceof Error ? error.message : 'AI_ANALYSIS_FAILED';
      const withAnalysis = error as { analysis?: AnalysisRecord };
      if (withAnalysis.analysis?.id) {
        current.analysisId = withAnalysis.analysis.id;
      }
    }

    input.onProgress?.({
      index,
      total,
      current: { ...current },
      items: queue.map((item) => ({ ...item })),
    });
  }

  return queue.map((item) => ({ ...item }));
}
