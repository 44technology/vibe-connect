import jwt, { SignOptions } from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const options: SignOptions = {
    expiresIn: expiresIn,
  };
  return jwt.sign(
    { userId },
    secret,
    options
  );
};

export const verifyToken = (token: string): { userId: string } => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as { userId: string };
};
