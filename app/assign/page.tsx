'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = ['General', 'Cleaning', 'Kitchen', 'Laundry', 'Yard', 'Pets', 'Errands'];

interface Member { id: string; name: string; avatar: string; isHome: boolean; role: string; }
interface AssignResult {
  assigned: {
    member: { id: string; name: string; avatar: string };
    task: { id: string; title: string; points: number };
  };
  emailSent: boolean;
}

export default function AssignPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssignResult | null>(null);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', category: 'General',
    difficulty: 'Medium', room: '',
  });

  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (!r.ok) { router.push('/login'); return null; } return r.json(); })
      .then(d => { if (d) setSession(d); });
    fetchPresence();
  }, []);

  async function fetchPresence() {
    const res = await fetch('/api/members/presence');
    if (res.ok) setMembers(await res.json() as Member[]);
  }

  async function togglePresence(memberId: string, current: boolean) {
    setTogglingId(memberId);
    await fetch('/api/members/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isHome: !current, memberId }),
    });
    await fetchPresence();
    setTogglingId(null);
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Task name is required'); return; }
    setLoading(true); setError(''); setResult(null);

    const res = await fetch('/api/tasks/assign-random', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form }),
    });

    const data = await res.json() as AssignResult & { error?: string };
    if (!res.ok) { setError(data.error || 'Assignment failed'); setLoading(false); return; }
    setResult(data);
    setForm({ title: '', description: '', category: 'General', difficulty: 'Medium', room: '' });
    setLoading(false);
  }

  const homeMembers = members.filter(m => m.isHome);
  const awayMembers = members.filter(m => !m.isHome);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-indigo-300 text-2xl">←</Link>
          <div>
            <h1 className="text-2xl font-black text-white">🎲 Quick Assign</h1>
            <p className="text-indigo-300 text-sm">Randomly assign an urgent task to someone home</p>
          </div>
        </div>

        {/* Result celebration */}
        {result && (
          <div className="bg-green-500/20 border border-green-500/40 rounded-2xl p-5 mb-6 text-center">
            <div className="text-4xl mb-2">{result.assigned.member.avatar}</div>
            <h2 className="text-white font-black text-xl mb-1">{result.assigned.member.name} got it!</h2>
            <p className="text-green-300 text-sm mb-1">"{result.assigned.task.title}"</p>
            <p className="text-amber-400 font-bold">+{result.assigned.task.points} pts on completion</p>
            {result.emailSent && (
              <p className="text-green-400 text-xs mt-2">✉️ Email notification sent</p>
            )}
            {!result.emailSent && (
              <p className="text-yellow-400 text-xs mt-2">⚠️ Email not configured — task assigned in app</p>
            )}
            <button onClick={() => setResult(null)}
              className="mt-4 px-6 py-2 bg-white/10 text-white rounded-xl text-sm font-semibold">
              Assign Another
            </button>
          </div>
        )}

        {/* Who's home */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
          <h2 className="text-white font-bold mb-3">Who's home right now?</h2>

          {homeMembers.length === 0 && (
            <p className="text-indigo-400 text-sm text-center py-2">Nobody marked as home — toggle below</p>
          )}

          <div className="space-y-2">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{member.avatar}</span>
                  <span className="text-white font-medium">{member.name}</span>
                  {member.id === session?.id && <span className="text-xs text-indigo-400">(you)</span>}
                </div>
                <button
                  onClick={() => togglePresence(member.id, member.isHome)}
                  disabled={togglingId === member.id}
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold transition ${member.isHome
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/30'
                    : 'bg-white/10 text-slate-400 border border-white/10 hover:bg-white/20'
                  }`}>
                  {togglingId === member.id ? '...' : member.isHome ? '🏠 Home' : '🚗 Away'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Task form */}
        {!result && (
          <form onSubmit={handleAssign} className="space-y-4">
            <h2 className="text-white font-bold">What needs to be done?</h2>

            {error && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm text-indigo-300 block mb-1">Task Name *</label>
              <input type="text" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Take out the trash now"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400" />
            </div>

            <div>
              <label className="text-sm text-indigo-300 block mb-1">Details (optional)</label>
              <textarea value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Any specific instructions..."
                rows={2}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-indigo-300 block mb-1">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400">
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-indigo-300 block mb-1">Difficulty</label>
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400">
                  {[['Easy', '5 pts'], ['Medium', '10 pts'], ['Hard', '20 pts']].map(([d, p]) => (
                    <option key={d} value={d} className="bg-slate-800">{d} — {p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
              <p className="text-purple-300 text-xs">
                🎲 Assignment is <strong>weighted random</strong> — members with fewer points this week are more likely to be picked, keeping it fair.
              </p>
            </div>

            <button type="submit" disabled={loading || homeMembers.length === 0}
              className="w-full py-4 bg-amber-400 text-slate-900 rounded-2xl font-black text-lg hover:bg-amber-300 transition disabled:opacity-40">
              {loading ? 'Picking someone...' : `🎲 Assign to Random Person (${homeMembers.length} home)`}
            </button>
          </form>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-t border-white/10 px-4 py-3">
        <div className="flex justify-around max-w-lg mx-auto">
          {[{ href: '/dashboard', icon: '🏠', label: 'Home' }, { href: '/tasks', icon: '📋', label: 'Tasks' }, { href: '/leaderboard', icon: '🏆', label: 'Rankings' }].map(item => (
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
