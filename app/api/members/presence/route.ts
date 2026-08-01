import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { isHome, memberId } = await request.json();

  const targetId = memberId || session.id;

  // parents can toggle anyone; members can only toggle themselves
  if (targetId !== session.id && session.role !== 'parent') {
    return NextResponse.json({ error: 'Parents only can toggle others' }, { status: 403 });
  }

  const updated = await prisma.member.update({
    where: { id: targetId, familyId: session.familyId },
    data: { isHome: Boolean(isHome) },
    select: { id: true, name: true, isHome: true },
  });

  return NextResponse.json(updated);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const members = await prisma.member.findMany({
    where: { familyId: session.familyId },
    select: { id: true, name: true, avatar: true, isHome: true, role: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(members);
}
