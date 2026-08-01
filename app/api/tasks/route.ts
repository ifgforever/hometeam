import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

const POINTS_MAP: Record<string, number> = { Easy: 5, Medium: 10, Hard: 20 };

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'all';

  const where: any = { familyId: session.familyId };
  if (filter === 'mine') where.assignedToId = session.id;
  if (filter === 'pending') where.status = 'pending';
  if (filter === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    where.status = 'pending';
    where.OR = [
      { dueDate: null },
      { dueDate: { gte: today, lt: tomorrow } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignedTo: { select: { id: true, name: true, avatar: true } },
      completions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'parent') return NextResponse.json({ error: 'Parents only' }, { status: 403 });

  const body = await request.json();
  const { title, description, category, room, difficulty, recurring, assignedToId, dueDate, priority } = body;

  const points = POINTS_MAP[difficulty] || 10;

  const task = await prisma.task.create({
    data: {
      familyId: session.familyId,
      title,
      description,
      category: category || 'General',
      room,
      difficulty: difficulty || 'Medium',
      points,
      recurring: recurring || 'once',
      assignedToId: assignedToId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'normal',
    },
    include: {
      assignedTo: { select: { id: true, name: true, avatar: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
