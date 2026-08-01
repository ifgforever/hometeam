import { prisma } from './db';

const BADGES = [
  { name: 'First Step', description: 'Complete your first task', icon: '🌱', condition: 'first_task' },
  { name: 'On Fire', description: '7-day contribution streak', icon: '🔥', condition: 'streak_7' },
  { name: 'Unstoppable', description: '30-day contribution streak', icon: '⚡', condition: 'streak_30' },
  { name: 'Century Club', description: 'Earn 100 total points', icon: '💯', condition: 'points_100' },
  { name: 'High Roller', description: 'Earn 500 total points', icon: '🏆', condition: 'points_500' },
  { name: 'Legend', description: 'Earn 1000 total points', icon: '👑', condition: 'points_1000' },
  { name: 'Clean Sweep', description: 'Complete 10 cleaning tasks', icon: '🧹', condition: 'cleaning_10' },
  { name: 'Chef\'s Kiss', description: 'Complete 10 kitchen tasks', icon: '👨‍🍳', condition: 'kitchen_10' },
  { name: 'Team Player', description: 'Complete 5 tasks in one day', icon: '🤝', condition: 'tasks_5_day' },
  { name: 'Top of the Week', description: 'Finish #1 on the weekly leaderboard', icon: '🥇', condition: 'weekly_top' },
];

export async function seedBadges() {
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }
}

export async function checkAndAwardBadges(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      completions: { include: { task: true } },
      badges: { include: { badge: true } },
    },
  });

  if (!member) return;

  const earned = new Set(member.badges.map((b: any) => b.badge.condition));
  const allBadges = await prisma.badge.findMany();
  const toAward: string[] = [];

  const totalPoints = member.totalPoints;
  const streak = member.streak;
  const totalCompletions = member.completions.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCompletions = member.completions.filter(
    (c: any) => new Date(c.createdAt) >= today
  ).length;

  const cleaningTasks = member.completions.filter(
    (c: any) => c.task.category === 'Cleaning'
  ).length;

  const kitchenTasks = member.completions.filter(
    (c: any) => c.task.category === 'Kitchen'
  ).length;

  if (totalCompletions >= 1 && !earned.has('first_task')) toAward.push('first_task');
  if (streak >= 7 && !earned.has('streak_7')) toAward.push('streak_7');
  if (streak >= 30 && !earned.has('streak_30')) toAward.push('streak_30');
  if (totalPoints >= 100 && !earned.has('points_100')) toAward.push('points_100');
  if (totalPoints >= 500 && !earned.has('points_500')) toAward.push('points_500');
  if (totalPoints >= 1000 && !earned.has('points_1000')) toAward.push('points_1000');
  if (cleaningTasks >= 10 && !earned.has('cleaning_10')) toAward.push('cleaning_10');
  if (kitchenTasks >= 10 && !earned.has('kitchen_10')) toAward.push('kitchen_10');
  if (todayCompletions >= 5 && !earned.has('tasks_5_day')) toAward.push('tasks_5_day');

  for (const condition of toAward) {
    const badge = allBadges.find((b: any) => b.condition === condition);
    if (badge) {
      await prisma.memberBadge.create({
        data: { memberId, badgeId: badge.id },
      });
    }
  }

  return toAward.length;
}

export { BADGES };
