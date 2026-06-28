import { asyncDb as poolAsyncDb } from './pool.js';

const MAX_IN_FLIGHT = Math.max(20, 4 * 4);
const QUEUE_MAX = 200;
const TASK_TIMEOUT_MS = 15_000;

interface QueueTask {
  resolve: (value: unknown) => void;
  reject: (err: Error) => void;
  method: 'all' | 'get' | 'run';
  sql: string;
  params: unknown[];
  timeout: ReturnType<typeof setTimeout>;
}

let inFlight = 0;
const pendingQueue: QueueTask[] = [];

export class QueueFullError extends Error {
  constructor() {
    super('El servidor está sobrecargado. Intenta de nuevo.');
    this.name = 'QueueFullError';
  }
}

export class QueryTimeoutError extends Error {
  constructor() {
    super('La consulta tardó demasiado.');
    this.name = 'QueryTimeoutError';
  }
}

function processQueue(): void {
  while (pendingQueue.length > 0 && inFlight < MAX_IN_FLIGHT) {
    const task = pendingQueue.shift()!;
    startTask(task);
  }
}

function startTask(task: QueueTask): void {
  inFlight++;

  const fn = poolAsyncDb[task.method] as (...args: unknown[]) => Promise<unknown>;

  Promise.race([
    fn(task.sql, ...task.params),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new QueryTimeoutError()), TASK_TIMEOUT_MS),
    ),
  ])
    .then((result) => {
      clearTimeout(task.timeout);
      task.resolve(result);
    })
    .catch((err) => {
      clearTimeout(task.timeout);
      task.reject(err instanceof Error ? err : new Error(String(err)));
    })
    .finally(() => {
      inFlight--;
      processQueue();
    });
}

function enqueue(method: 'all' | 'get' | 'run', sql: string, params: unknown[]): Promise<unknown> {
  if (pendingQueue.length >= QUEUE_MAX) {
    return Promise.reject(new QueueFullError());
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const idx = pendingQueue.findIndex((t) => t.resolve === resolve);
      if (idx >= 0) {
        pendingQueue.splice(idx, 1);
        reject(new QueryTimeoutError());
      }
    }, TASK_TIMEOUT_MS + 5000);

    pendingQueue.push({ resolve, reject, method, sql, params, timeout });
    processQueue();
  });
}

export const asyncDb = {
  all(sql: string, ...params: unknown[]): Promise<unknown[]> {
    return enqueue('all', sql, params) as Promise<unknown[]>;
  },
  get(sql: string, ...params: unknown[]): Promise<unknown> {
    return enqueue('get', sql, params) as Promise<unknown>;
  },
  run(sql: string, ...params: unknown[]): Promise<{ changes: number; lastInsertRowid: number | bigint }> {
    return enqueue('run', sql, params) as Promise<{ changes: number; lastInsertRowid: number | bigint }>;
  },
};

export function getQueueStats() {
  const total = 4; /* pool size */
  return {
    pending: pendingQueue.length,
    inFlight,
    maxPending: QUEUE_MAX,
    maxInFlight: MAX_IN_FLIGHT,
    utilization: inFlight / MAX_IN_FLIGHT,
    totalWorkers: total,
  };
}
