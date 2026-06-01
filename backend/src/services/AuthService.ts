import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { BadRequestError, UnauthorizedError } from './errors';

export interface AuthPayload {
  storeId: string;
  username: string;
}

export class AuthService {
  authenticate(storeId: string, username: string, password: string): { token: string; storeId: string } {
    if (!storeId || !username || !password) {
      throw new BadRequestError('storeId, username, and password are required');
    }

    const admin = config.admin;
    if (storeId !== admin.storeId || username !== admin.username || password !== admin.password) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload: AuthPayload = { storeId, username };
    const options: SignOptions = { expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'] };
    const token = jwt.sign(payload, config.jwtSecret, options);
    return { token, storeId };
  }

  verifyToken(token: string): AuthPayload | null {
    try {
      return jwt.verify(token, config.jwtSecret) as AuthPayload;
    } catch {
      return null;
    }
  }
}
