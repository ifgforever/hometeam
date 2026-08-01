import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sendTaskAssignmentEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as {
    taskId?: string; excludeSelf?: boolean; title?: string; description?: string;
    category?: string; room?: string; difficulty?: string;
  };
  const { taskId, excludeSelf } = body;

  // get all members currently home in this family
  const availableMembers = await prisma.member.findMany({
    where: {
      familyId: session.familyId,
      isHome: true,
      ...(excludeSelf ? { id: { not: session.id } } : {}),
    },
    select: { id: true, name: true, email: true, avatar: true, weekPoints: true },
  });

  if (availableMembers.length === 0) {
    return NextResponse.json({ error: 'No members are currently marked as home' }, { status: 400 });
  }

  // pick a random member — weighted so lower-point members get picked more often
  const totalWeight = availableMembers.reduce((sum: number, m: any) => sum + 1 / (m.weekPoints + 1), 0);
  let rand = Math.random() * totalWeight;
  let chosen = availableMembers[0];
  for (const member of availableMembers) {
    rand -= 1 / (member.weekPoints + 1);
    if (rand <= 0) { chosen = member; break; }
  }

  let task;

  if (taskId) {
    // assign a specific existing task
    task = await prisma.task.findFirst({
      where: { id: taskId, familyId: session.familyId },
    });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    task = await prisma.task.update({
      where: { id: taskId },
      data: { assignedToId: chosen.id, priority: 'high', status: 'pending' },
    });
  } else {
    // create a brand new urgent task from the request body
    const { title, description, category, room, difficulty } = body;
    if (!title) return NextResponse.json({ error: 'title required when no taskId provided' }, { status: 400 });

    const pointsMap: Record<string, number> = { Easy: 5, Medium: 10, Hard: 20 };
    const points = pointsMap[difficulty || 'Medium'] || 10;

    task = await prisma.task.create({
      data: {
        familyId: session.familyId,
        title,
        description,
        category: category || 'General',
        room,
        difficulty: difficulty || 'Medium',
        points,
        priority: 'high',
        recurring: 'once',
        assignedToId: chosen.id,
        status: 'pending',
      },
    });
  }

  // send email if SMTP is configured
  let emailSent = false;
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      await sendTaskAssignmentEmail({
        toEmail: chosen.email,
        toName: chosen.name,
        familyName: session.family.name,
        taskTitle: task.title,
        taskDescription: task.description || undefined,
        taskCategory: task.category,
        taskPoints: task.points,
        taskPriority: task.priority,
        assignedBy: session.name,
      });
      emailSent = true;
    } catch (err) {
      console.error('Email send failed:', err);
    }
  }

  return NextResponse.json({
    assigned: {
      member: { id: chosen.id, name: chosen.name, avatar: chosen.avatar },
      task: { id: task.id, title: task.title, points: task.points },
    },
    emailSent,
  });
}
