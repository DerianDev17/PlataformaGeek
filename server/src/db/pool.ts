import { Worker } from 'worker_threads';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKER_PATH = path.join(__dirname, 'worker.js');

const numWorkers = Math.max(2, Math.min(os.cpus().length, 8));
const workers: Worker[] = [];
let nextWorker = 0;

interface PendingQuery {
  id: number;
  worker: Worker;
  reject: (err: Error) => void;
}
const pendingByWorker = new WeakMap<Worker, Map<number, PendingQuery>>();

function registerPending(worker: Worker, q: PendingQuery): void {
  let map = pendingByWorker.get(worker);
  if (!map) {
    map = new Map();
    pendingByWorker.set(worker, map);
  }
  map.set(q.id, q);
}

function rejectAllForWorker(worker: Worker, reason: string): void {
  const map = pendingByWorker.get(worker);
  if (!map) return;
  for (const [, q] of map) {
    q.reject(new Error(reason));
  }
  map.clear();
}

function spawnWorker(index: number): void {
  const worker = new Worker(WORKER_PATH);
  worker.on('error', (err: Error) => {
    console.error(`[worker:${index}] crash:`, err.message);
    console.warn(`[pool] Replacing crashed worker ${index}...`);
    rejectAllForWorker(worker, `Worker ${index} crashed: ${err.message}`);
    const idx = workers.indexOf(worker);
    if (idx !== -1) {
      workers.splice(idx, 1);
    }
    spawnWorker(index);
  });
  worker.on('exit', (code: number) => {
    if (code !== 0) {
      rejectAllForWorker(worker, `Worker exited with code ${code}`);
    }
  });
  workers.push(worker);
}

for (let i = 0; i < numWorkers; i++) {
  spawnWorker(i);
}

let queryId = 0;

function execute(method: 'all' | 'get' | 'run', sql: string, params?: unknown[]): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const id = ++queryId;
    const worker = workers[nextWorker % numWorkers];
    nextWorker++;

    const handler = (msg: { id: number; result?: unknown; error?: string }) => {
      if (msg.id === id) {
        worker.off('message', handler);
        pendingByWorker.get(worker)?.delete(id);
        if (msg.error) {
          reject(new Error(msg.error));
        } else {
          resolve(msg.result);
        }
      }
    };
    worker.on('message', handler);
    registerPending(worker, { id, worker, reject });
    worker.postMessage({ id, sql, params, method });
  });
}

export const asyncDb = {
  all(sql: string, ...params: unknown[]): Promise<unknown[]> {
    return execute('all', sql, params.length ? params : undefined) as Promise<unknown[]>;
  },
  get(sql: string, ...params: unknown[]): Promise<unknown> {
    return execute('get', sql, params.length ? params : undefined) as Promise<unknown>;
  },
  run(sql: string, ...params: unknown[]): Promise<{ changes: number; lastInsertRowid: number | bigint }> {
    return execute('run', sql, params.length ? params : undefined) as Promise<{ changes: number; lastInsertRowid: number | bigint }>;
  },
};
