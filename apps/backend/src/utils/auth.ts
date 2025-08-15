import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';
import { UserRole } from '../models';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: { id: string; email: string; role: UserRole }): string => {
  const options = {
    expiresIn: config.jwtExpiresIn,
  };
  return jwt.sign(payload, config.jwtSecret, options as any);
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwtSecret);
};

export const generateResetToken = (): string => {
  return jwt.sign({ type: 'password_reset' }, config.jwtSecret, {
    expiresIn: '1h',
  });
};

export const generateBookingReference = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `APPT-${timestamp}-${random}`.toUpperCase();
};

export const generateQRCode = (bookingRef: string): string => {
  // QR code generation logic will be implemented in future phases
  // For now, return a placeholder URL
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${bookingRef}`;
};