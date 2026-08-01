import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { checkAndAwardBadges } from '@/lib/badges';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { taskId, note } = await request.json();

  const task = await prisma.task.findFirst({
    where: { id: taskId, familyId: session.familyId },
  });

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (task.status === 'completed') return NextResponse.json({ error: 'Already completed' }, { status: 400 });

  const completion = await prisma.completion.create({
    data: {
      taskId,
      memberId: session.id,
      points: task.points,
      note,
    },
  });

  if (task.recurring === 'once') {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'completed' },
    });
  } else {
    const nextDue = new Date();
    if (task.recurring === 'daily') nextDue.setDate(nextDue.getDate() + 1);
    else if (task.recurring === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
    else if (task.recurring === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);

    await prisma.task.update({
      where: { id: taskId },
      data: { dueDate: nextDue, status: 'pending' },
    });
  }

  const lastActive = session.lastActive;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const newStreak = lastActive && new Date(lastActive) >= yesterday
    ? session.streak + 1
    : 1;

  await prisma.member.update({
    where: { id: session.id },
    data: {
      totalPoints: { increment: task.points },
      weekPoints: { increment: task.points },
      streak: newStreak,
      lastActive: new Date(),
    },
  });

  const newBadges = await checkAndAwardBadges(session.id);

  return NextResponse.json({
    completion,
    pointsEarned: task.points,
    newBadges: newBadges || 0,
    streak: newStreak,
  });
}
