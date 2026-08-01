import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({
    id: session.id,
    name: session.name,
    avatar: session.avatar,
    role: session.role,
    totalPoints: session.totalPoints,
    weekPoints: session.weekPoints,
    streak: session.streak,
    family: {
      id: session.family.id,
      name: session.family.name,
      inviteCode: session.family.inviteCode,
    },
  });
}
