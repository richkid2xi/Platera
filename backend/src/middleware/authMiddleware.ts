import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.platera_auth_session;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: No token provided', code: 'UNAUTHORIZED' });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token', code: 'UNAUTHORIZED' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions', code: 'FORBIDDEN' });
      return;
    }
    
    next();
  };
};
