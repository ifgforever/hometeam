'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Task {
  id: string; title: string; description?: string;
  category: string; room?: string; difficulty: string;
  points: number; priority: string; recurring: string; status: string;
  assignedTo?: { name: string; avatar: string };
}

const CATEGORY_COLORS: Record<string, string> = {
  Cleaning: 'bg-blue-500/20 text-blue-300', Kitchen: 'bg-orange-500/20 text-orange-300',
  Laundry: 'bg-purple-500/20 text-purple-300', Yard: 'bg-green-500/20 text-green-300',
  Pets: 'bg-yellow-500/20 text-yellow-300', Errands: 'bg-pink-500/20 text-pink-300',
  General: 'bg-slate-500/20 text-slate-300',
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [role, setRole] = useState('member');
  const [completing, setCompleting] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (!r.ok) router.push('/login'); return r.json() as Promise<{ role: string }>; })
      .then(d => setRole(d.role));
    fetch('/api/tasks?filter=all').then(r => r.json() as Promise<Task[]>).then(setTasks);
  }, []);

  async function completeTask(taskId: string, points: number) {
    setCompleting(taskId);
    const res = await fetch('/api/tasks/complete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    if (res.ok) {
      setCelebration(points);
      setTimeout(() => setCelebration(null), 2500);
      const updated = await fetch('/api/tasks?filter=all').then(r => r.json() as Promise<Task[]>);
      setTasks(updated);
    }
    setCompleting(null);
  }

  const pending = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 pb-24">
      {celebration && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-slate-900 px-6 py-3 rounded-2xl font-bold shadow-lg animate-bounce">
          +{celebration} pts! 🎉
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-white">📋 All Tasks</h1>
          {role === 'parent' && (
            <Link href="/tasks/new" className="px-4 py-2 bg-amber-400 text-slate-900 rounded-xl font-bold text-sm">+ New</Link>
          )}
        </div>

        <div className="space-y-3 mb-8">
          <h2 className="text-indigo-300 text-sm font-semibold uppercase tracking-wide">Pending ({pending.length})</h2>
          {pending.length === 0 && <p className="text-indigo-400 text-sm text-center py-4">No pending tasks 🎉</p>}
          {pending.map(task => (
            <div key={task.id} className={`bg-white/10 rounded-2xl p-4 border ${task.priority === 'high' ? 'border-red-400/50' : 'border-white/10'}`}>
              <div className="flex justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {task.priority === 'high' && <span className="text-xs text-red-400 font-bold">🚨</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[task.category] || CATEGORY_COLORS.General}`}>{task.category}</span>
                    {task.room && <span className="text-xs text-slate-400">{task.room}</span>}
                    <span className="text-xs text-indigo-400">{task.difficulty}</span>
                    {task.recurring !== 'once' && <span className="text-xs text-purple-300">↻</span>}
                  </div>
                  <p className="text-white font-semibold">{task.title}</p>
                  {task.description && <p className="text-indigo-300 text-xs mt-1">{task.description}</p>}
                  {task.assignedTo && <p className="text-indigo-300 text-xs mt-1">{task.assignedTo.avatar} {task.assignedTo.name}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-amber-400 font-bold text-sm">+{task.points}</span>
                  <button onClick={() => completeTask(task.id, task.points)} disabled={completing === task.id}
                    className="px-3 py-2 bg-green-500 text-white rounded-xl text-xs font-bold disabled:opacity-50">
                    {completing === task.id ? '...' : 'Done ✓'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {completed.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-indigo-300 text-sm font-semibold uppercase tracking-wide">Completed ({completed.length})</h2>
            {completed.map(task => (
              <div key={task.id} className="bg-white/5 rounded-2xl p-3 border border-white/5 opacity-60">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm line-through">{task.title}</span>
                  <span className="text-green-400 text-xs">✓ +{task.points}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-t border-white/10 px-4 py-3">
        <div className="flex justify-around max-w-lg mx-auto">
          {[{ href: '/dashboard', icon: '🏠', label: 'Home' }, { href: '/tasks', icon: '📋', label: 'Tasks' }, { href: '/assign', icon: '🎲', label: 'Assign' }, { href: '/leaderboard', icon: '🏆', label: 'Rankings' }].map(item => (
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
