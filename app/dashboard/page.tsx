'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  category: string;
  room: string;
  difficulty: string;
  points: number;
  priority: string;
  recurring: string;
  status: string;
  assignedTo?: { id: string; name: string; avatar: string };
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  weekPoints: number;
  streak: number;
  role: string;
}

interface Session {
  id: string;
  name: string;
  avatar: string;
  role: string;
  totalPoints: number;
  weekPoints: number;
  streak: number;
  family: { id: string; name: string; inviteCode: string };
}

const CATEGORY_COLORS: Record<string, string> = {
  Cleaning: 'bg-blue-500/20 text-blue-300',
  Kitchen: 'bg-orange-500/20 text-orange-300',
  Laundry: 'bg-purple-500/20 text-purple-300',
  Yard: 'bg-green-500/20 text-green-300',
  Pets: 'bg-yellow-500/20 text-yellow-300',
  Errands: 'bg-pink-500/20 text-pink-300',
  General: 'bg-slate-500/20 text-slate-300',
};

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{ points: number; badge?: boolean } | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [tab, setTab] = useState<'today' | 'all' | 'mine'>('today');

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [tab]);

  async function fetchAll() {
    try {
      const [sessionRes, membersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/members'),
      ]);
      if (!sessionRes.ok) { router.push('/login'); return; }
      const [sessionData, membersData] = await Promise.all([
        sessionRes.json() as Promise<Session>,
        membersRes.json() as Promise<Member[]>,
      ]);
      setSession(sessionData);
      setMembers(membersData);
      await fetchTasks();
    } finally {
      setLoading(false);
    }
  }

  async function fetchTasks() {
    const res = await fetch(`/api/tasks?filter=${tab}`);
    if (res.ok) setTasks(await res.json() as Task[]);
  }

  async function completeTask(taskId: string) {
    setCompleting(taskId);
    try {
      const res = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      if (!res.ok) return;
      const data = await res.json() as { pointsEarned: number; newBadges: number };
      setCelebration({ points: data.pointsEarned, badge: data.newBadges > 0 });
      setTimeout(() => setCelebration(null), 3000);
      await fetchAll();
    } finally {
      setCompleting(null);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white text-xl animate-pulse">Loading HomeTeam...</div>
    </div>
  );

  const topMember = members[0];
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 pb-24">
      {celebration && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-slate-900 px-6 py-3 rounded-2xl font-bold text-lg shadow-lg animate-bounce">
          +{celebration.points} pts! {celebration.badge ? '🎖️ New Badge!' : '🎉'}
        </div>
      )}

      {showInvite && session && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4" onClick={() => setShowInvite(false)}>
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <h2 className="text-white font-bold text-xl mb-2">Invite Code</h2>
            <p className="text-indigo-300 text-sm mb-4">Share this with your family members</p>
            <div className="text-4xl font-black tracking-widest text-amber-400 bg-amber-400/10 rounded-xl py-4 mb-4">
              {session.family.inviteCode}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(session.family.inviteCode); }}
              className="w-full py-3 bg-amber-400 text-slate-900 rounded-xl font-bold">
              Copy Code
            </button>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-indigo-300 text-sm">{session?.family.name}</p>
            <h1 className="text-2xl font-black text-white">{session?.avatar} {session?.name}</h1>
          </div>
          <div className="flex gap-2">
            {session?.role === 'parent' && (
              <button onClick={() => setShowInvite(true)}
                className="p-2 bg-white/10 rounded-xl text-white text-sm border border-white/20">
                🔗 Invite
              </button>
            )}
            <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); }}
              className="p-2 bg-white/10 rounded-xl text-white text-sm border border-white/20">
              Exit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10">
            <div className="text-2xl font-black text-amber-400">{session?.weekPoints}</div>
            <div className="text-xs text-indigo-300">This Week</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10">
            <div className="text-2xl font-black text-amber-400">{session?.totalPoints}</div>
            <div className="text-xs text-indigo-300">Total Pts</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10">
            <div className="text-2xl font-black text-orange-400">{session?.streak}🔥</div>
            <div className="text-xs text-indigo-300">Day Streak</div>
          </div>
        </div>

        {members.length > 1 && (
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white font-bold text-sm">🏆 This Week</span>
              <Link href="/leaderboard" className="text-amber-400 text-xs font-semibold">Full Board →</Link>
            </div>
            <div className="space-y-2">
              {members.slice(0, 3).map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="text-sm w-5">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <span className="text-xl">{m.avatar}</span>
                  <span className="text-white text-sm flex-1">{m.name}</span>
                  <span className="text-amber-400 font-bold text-sm">{m.weekPoints} pts</span>
                  {m.streak > 0 && <span className="text-orange-400 text-xs">{m.streak}🔥</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-bold text-lg">Tasks</h2>
          <div className="flex gap-1">
            {(['today', 'mine', 'all'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition capitalize ${tab === t ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-indigo-300'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {session?.role === 'parent' && (
            <Link href="/tasks/new"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 border border-dashed border-white/20 rounded-2xl text-indigo-300 font-semibold hover:bg-white/20 transition text-sm">
              + Add Task
            </Link>
          )}
          <Link href="/assign"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-400/20 border border-amber-400/40 rounded-2xl text-amber-300 font-bold hover:bg-amber-400/30 transition text-sm">
            🎲 Quick Assign
          </Link>
        </div>

        <div className="space-y-3">
          {pendingTasks.length === 0 && (
            <div className="text-center py-12 text-indigo-300">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold">All caught up!</p>
            </div>
          )}
          {pendingTasks.map(task => (
            <div key={task.id} className={`bg-white/10 rounded-2xl p-4 border ${task.priority === 'high' ? 'border-red-400/50' : 'border-white/10'}`}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {task.priority === 'high' && <span className="text-xs text-red-400 font-bold">🚨 URGENT</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[task.category] || CATEGORY_COLORS.General}`}>
                      {task.category}
                    </span>
                    {task.room && <span className="text-xs text-slate-400">{task.room}</span>}
                    {task.recurring !== 'once' && <span className="text-xs text-purple-300">↻ {task.recurring}</span>}
                  </div>
                  <h3 className="text-white font-semibold">{task.title}</h3>
                  {task.assignedTo && (
                    <p className="text-indigo-300 text-xs mt-1">{task.assignedTo.avatar} {task.assignedTo.name}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-amber-400 font-bold text-sm">+{task.points}</span>
                  <button
                    onClick={() => completeTask(task.id)}
                    disabled={completing === task.id}
                    className="px-3 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-400 transition disabled:opacity-50 whitespace-nowrap">
                    {completing === task.id ? '...' : 'Done ✓'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-t border-white/10 px-4 py-3">
        <div className="flex justify-around max-w-lg mx-auto">
          {[
            { href: '/dashboard', icon: '🏠', label: 'Home' },
            { href: '/tasks', icon: '📋', label: 'Tasks' },
            { href: '/assign', icon: '🎲', label: 'Assign' },
            { href: '/leaderboard', icon: '🏆', label: 'Rankings' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 text-indigo-300 hover:text-amber-400 transition">
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
