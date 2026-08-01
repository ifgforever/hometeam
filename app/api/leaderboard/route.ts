import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const members = await prisma.member.findMany({
    where: { familyId: session.familyId },
    select: {
      id: true,
      name: true,
      avatar: true,
      totalPoints: true,
      weekPoints: true,
      streak: true,
      badges: {
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      },
      completions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { task: { select: { title: true } } },
      },
    },
    orderBy: { weekPoints: 'desc' },
  });

  return NextResponse.json(members);
}
