import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// Cache for 24 hours to prevent duplicate requests
export const idempotencyCache = new NodeCache({ stdTTL: 24 * 60 * 60 });

export const requireIdempotencyKey = (req: Request, res: Response, next: NextFunction): void => {
  const key = req.headers['idempotency-key'];
  if (!key || typeof key !== 'string') {
    res.status(400).json({ error: 'Idempotency-Key header is required for this request', code: 'MISSING_IDEMPOTENCY_KEY' });
    return;
  }

  // If the key exists, it means we've already processed (or are processing) this request
  if (idempotencyCache.has(key)) {
    const cachedResponse = idempotencyCache.get(key);
    // If we have a cached response, return it. If it's a marker 'processing', return 409
    if (cachedResponse === 'processing') {
      res.status(409).json({ error: 'Request is already being processed', code: 'CONFLICT' });
    } else {
      res.status(200).json(cachedResponse);
    }
    return;
  }

  // Mark as processing
  idempotencyCache.set(key, 'processing');

  // Override res.json to capture the response and cache it
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    // Only cache successful responses (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyCache.set(key, body);
    } else {
      // If error, delete the key so they can retry
      idempotencyCache.del(key);
    }
    return originalJson(body);
  };

  next();
};
