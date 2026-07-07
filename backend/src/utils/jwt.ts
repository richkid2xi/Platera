import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRY = env.JWT_EXPIRY;

export interface JwtPayload {
  id: string;
  restaurantId: string;
  role: string;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY as any });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
