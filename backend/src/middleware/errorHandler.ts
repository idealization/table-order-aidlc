import { Request, Response, NextFunction } from 'express';
import { AppError } from '../services/errors';

// 동기/비동기 핸들러를 감싸 에러를 next로 전달
export function handle(
  fn: (req: Request, res: Response) => unknown | Promise<unknown>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (err) {
      next(err);
    }
  };
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
