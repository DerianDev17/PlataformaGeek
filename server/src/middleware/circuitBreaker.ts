import type { Request, Response, NextFunction } from 'express';

enum State {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

let state = State.CLOSED;
let failureCount = 0;
let lastStateChange = Date.now();

const FAILURE_THRESHOLD = 15;
const OPEN_TIMEOUT_MS = 30_000;
const DECAY_INTERVAL_MS = 15_000;

export function recordFailure(): void {
  failureCount++;
  if (failureCount >= FAILURE_THRESHOLD && state === State.CLOSED) {
    state = State.OPEN;
    lastStateChange = Date.now();
    console.error(`[circuit-breaker] OPEN — ${failureCount} fallos consecutivos`);
  }
}

function recordSuccess(): void {
  if (state === State.HALF_OPEN) {
    failureCount = 0;
    state = State.CLOSED;
    lastStateChange = Date.now();
    console.log('[circuit-breaker] CLOSED — recuperación confirmada');
  }
}

export function circuitBreaker(_req: Request, res: Response, next: NextFunction): void {
  const now = Date.now();

  if (state === State.OPEN) {
    if (now - lastStateChange > OPEN_TIMEOUT_MS) {
      state = State.HALF_OPEN;
      lastStateChange = now;
      console.log('[circuit-breaker] HALF_OPEN — probando recuperación');
    } else {
      res.status(503).json({
        success: false,
        error: { code: 'SERVICE_UNAVAILABLE', message: 'Servicio temporalmente no disponible. Intenta de nuevo en unos segundos.' },
      });
      return;
    }
  }

  if (state === State.HALF_OPEN && failureCount > 0) {
    state = State.OPEN;
    lastStateChange = now;
    res.status(503).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Servicio temporalmente no disponible.' },
    });
    return;
  }

  res.on('finish', () => {
    if (res.statusCode >= 500) {
      recordFailure();
    } else {
      recordSuccess();
    }
  });

  next();
}

setInterval(() => {
  if (state === State.CLOSED && failureCount > 0) {
    failureCount = Math.max(0, failureCount - 1);
  }
}, DECAY_INTERVAL_MS);

export function getCircuitState() {
  return {
    state: State[state],
    failures: failureCount,
    stateChangedAt: new Date(lastStateChange).toISOString(),
  };
}
