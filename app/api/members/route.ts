import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const members = await prisma.member.findMany({
    where: { familyId: session.familyId },
    select: { id: true, name: true, avatar: true, role: true, totalPoints: true, weekPoints: true, streak: true },
    orderBy: { totalPoints: 'desc' },
  });

  return NextResponse.json(members);
}
