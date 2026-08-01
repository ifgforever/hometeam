'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Member {
  id: string; name: string; avatar: string;
  totalPoints: number; weekPoints: number; streak: number;
  badges: { badge: { name: string; icon: string; description: string } }[];
  completions: { task: { title: string }; createdAt: string }[];
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Member | null>(null);

  useEffect(() => {
    fetch('/api/leaderboard').then(r => {
      if (!r.ok) { router.push('/login'); return null; }
      return r.json();
    }).then(data => { if (data) setMembers(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white animate-pulse">Loading rankings...</div>
    </div>
  );

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 pb-24">
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center" onClick={() => setSelected(null)}>
          <div className="bg-slate-800 rounded-t-3xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">{selected.avatar}</div>
              <h2 className="text-2xl font-black text-white">{selected.name}</h2>
              <div className="flex justify-center gap-4 mt-3">
                <div className="text-center"><div className="text-xl font-bold text-amber-400">{selected.totalPoints}</div><div className="text-xs text-indigo-300">Total Pts</div></div>
                <div className="text-center"><div className="text-xl font-bold text-amber-400">{selected.weekPoints}</div><div className="text-xs text-indigo-300">This Week</div></div>
                <div className="text-center"><div className="text-xl font-bold text-orange-400">{selected.streak}🔥</div><div className="text-xs text-indigo-300">Streak</div></div>
              </div>
            </div>
            {selected.badges.length > 0 && (
              <div className="mb-4">
                <p className="text-indigo-300 text-sm font-semibold mb-2">Badges</p>
                <div className="flex flex-wrap gap-2">
                  {selected.badges.map(b => (
                    <div key={b.badge.name} title={b.badge.description} className="bg-white/10 rounded-xl px-3 py-2 text-center">
                      <div className="text-xl">{b.badge.icon}</div>
                      <div className="text-xs text-indigo-300">{b.badge.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selected.completions.length > 0 && (
              <div>
                <p className="text-indigo-300 text-sm font-semibold mb-2">Recent Activity</p>
                <div className="space-y-1">
                  {selected.completions.map((c, i) => (
                    <div key={i} className="text-white text-sm flex items-center gap-2">
                      <span className="text-green-400">✓</span> {c.task.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setSelected(null)} className="w-full mt-6 py-3 bg-white/10 text-white rounded-xl font-semibold">Close</button>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-indigo-300">←</Link>
          <h1 className="text-2xl font-black text-white">🏆 Weekly Rankings</h1>
        </div>

        <div className="bg-white/5 rounded-2xl p-3 border border-white/10 mb-4">
          <p className="text-xs text-indigo-400 text-center">Resets every Sunday • Points carry over to total</p>
        </div>

        <div className="space-y-3">
          {members.map((member, i) => (
            <button key={member.id} onClick={() => setSelected(member)}
              className={`w-full text-left rounded-2xl p-4 border transition ${i === 0 ? 'bg-amber-400/10 border-amber-400/30' : 'bg-white/10 border-white/10 hover:bg-white/15'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl w-8">{medals[i] || `${i + 1}.`}</span>
                <span className="text-3xl">{member.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold">{member.name}</div>
                  <div className="flex gap-3 mt-0.5">
                    {member.badges.slice(0, 3).map(b => (
                      <span key={b.badge.name} title={b.badge.name} className="text-sm">{b.badge.icon}</span>
                    ))}
                    {member.streak > 0 && <span className="text-xs text-orange-400">{member.streak}🔥</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-amber-400 font-black text-xl">{member.weekPoints}</div>
                  <div className="text-indigo-400 text-xs">pts this week</div>
                </div>
              </div>
            </button>
          ))}

          {members.length === 0 && (
            <div className="text-center py-12 text-indigo-300">
              <div className="text-4xl mb-3">🏆</div>
              <p>No activity yet — complete tasks to appear here!</p>
            </div>
          )}
        </div>
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
