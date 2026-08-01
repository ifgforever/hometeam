import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'hometeam-secret';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateToken(memberId: string) {
  return jwt.sign({ memberId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): { memberId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { memberId: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ht_token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return prisma.member.findUnique({
    where: { id: decoded.memberId },
    include: { family: true },
  });
}

export function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
