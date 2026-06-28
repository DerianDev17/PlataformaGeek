import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/errors.js';
import { error } from '../lib/response.js';
import { recordFailure } from './circuitBreaker.js';
import { QueueFullError, QueryTimeoutError } from '../db/queue.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof QueueFullError) {
    res.status(503).json(error('QUEUE_FULL', err.message));
    recordFailure();
    return;
  }

  if (err instanceof QueryTimeoutError) {
    res.status(503).json(error('QUERY_TIMEOUT', 'La consulta excedió el tiempo límite'));
    recordFailure();
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(error(err.code, err.message, err.details));
    return;
  }

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json(error('VALIDATION_ERROR', 'Datos inválidos', details));
    return;
  }

  if (err instanceof jwt.JsonWebTokenError) {
    res.status(401).json(error('UNAUTHORIZED', 'Token inválido o expirado'));
    return;
  }

  if (err instanceof jwt.TokenExpiredError) {
    res.status(401).json(error('UNAUTHORIZED', 'Token expirado'));
    return;
  }

  if (err instanceof SyntaxError && err.message.includes('JSON')) {
    res.status(400).json(error('VALIDATION_ERROR', 'JSON inválido en la solicitud'));
    return;
  }

  console.error('Unhandled error:', err);
  recordFailure();

  res.status(500).json(error('INTERNAL_ERROR', 'Error interno del servidor'));
}
