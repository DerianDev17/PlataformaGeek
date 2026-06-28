import { Router } from 'express';
import { getQueueStats } from '../db/queue.js';
import { cache } from '../db/cache.js';
import { getCircuitState } from '../middleware/circuitBreaker.js';
import { success } from '../lib/response.js';

const router = Router();
const startTime = Date.now();

router.get('/', (_req, res) => {
  const queue = getQueueStats();
  const circuit = getCircuitState();
  const mem = process.memoryUsage();

  const degraded = queue.utilization > 0.7;
  const unhealthy = queue.utilization > 0.9 || circuit.state === 'OPEN';

  const status = unhealthy ? 'unhealthy' : degraded ? 'degraded' : 'ok';

  res.json(success({
    status,
    uptime: (Date.now() - startTime) / 1000,
    workers: {
      total: queue.totalWorkers,
    },
    queue: {
      pending: queue.pending,
      inFlight: queue.inFlight,
      maxPending: queue.maxPending,
      utilization: Math.round(queue.utilization * 100) / 100,
    },
    cache: {
      entries: cache.size,
    },
    circuit,
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100,
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024 * 100) / 100,
      rssMB: Math.round(mem.rss / 1024 / 1024 * 100) / 100,
    },
    timestamp: new Date().toISOString(),
  }, status === 'ok' ? 'Saludable' : 'Degradado'));
});

export default router;
