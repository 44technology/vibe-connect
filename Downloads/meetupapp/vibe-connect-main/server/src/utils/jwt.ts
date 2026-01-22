import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    { userId },
    secret,
    { expiresIn: expiresIn as string | number }
  );
};

export const verifyToken = (token: string): { userId: string } => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as { userId: string };
};
