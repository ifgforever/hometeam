'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = ['General', 'Cleaning', 'Kitchen', 'Laundry', 'Yard', 'Pets', 'Errands'];
const ROOMS = ['', 'Kitchen', 'Living Room', 'Bathroom', 'Bedroom', 'Garage', 'Yard', 'Laundry Room', 'Basement'];

interface Member { id: string; name: string; avatar: string; }

export default function NewTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', category: 'General', room: '',
    difficulty: 'Medium', recurring: 'once', assignedToId: '',
    priority: 'normal', dueDate: '',
  });

  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (!r.ok) router.push('/login'); return r.json(); })
      .then(d => { if (d.role !== 'parent') router.push('/dashboard'); });
    fetch('/api/members').then(r => r.json()).then(setMembers);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, assignedToId: form.assignedToId || null }),
    });
    if (res.ok) router.push('/dashboard');
    setLoading(false);
  };

  const POINTS = { Easy: 5, Medium: 10, Hard: 20 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 px-4 py-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-indigo-300 text-2xl">←</Link>
          <h1 className="text-2xl font-black text-white">Add New Task</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-indigo-300 block mb-1">Task Name *</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
              placeholder="e.g. Clean the bathroom"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400" />
          </div>

          <div>
            <label className="text-sm text-indigo-300 block mb-1">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
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
              <label className="text-sm text-indigo-300 block mb-1">Room</label>
              <select value={form.room} onChange={e => setForm({ ...form, room: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400">
                {ROOMS.map(r => <option key={r} value={r} className="bg-slate-800">{r || 'Any room'}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-indigo-300 block mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                <button type="button" key={d} onClick={() => setForm({ ...form, difficulty: d })}
                  className={`py-3 rounded-xl font-bold text-sm transition ${form.difficulty === d ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-indigo-300 hover:bg-white/20'}`}>
                  {d} <span className="text-xs">({POINTS[d]} pts)</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-indigo-300 block mb-2">Frequency</label>
            <div className="grid grid-cols-4 gap-2">
              {['once', 'daily', 'weekly', 'monthly'].map(r => (
                <button type="button" key={r} onClick={() => setForm({ ...form, recurring: r })}
                  className={`py-2 rounded-xl font-bold text-xs transition capitalize ${form.recurring === r ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-indigo-300 hover:bg-white/20'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-indigo-300 block mb-2">Priority</label>
            <div className="grid grid-cols-2 gap-2">
              {[['normal', 'Normal'], ['high', '🚨 Urgent']].map(([val, label]) => (
                <button type="button" key={val} onClick={() => setForm({ ...form, priority: val })}
                  className={`py-3 rounded-xl font-bold text-sm transition ${form.priority === val ? val === 'high' ? 'bg-red-500 text-white' : 'bg-amber-400 text-slate-900' : 'bg-white/10 text-indigo-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-indigo-300 block mb-1">Assign To (optional)</label>
            <select value={form.assignedToId} onChange={e => setForm({ ...form, assignedToId: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-400">
              <option value="" className="bg-slate-800">Anyone</option>
              {members.map(m => <option key={m.id} value={m.id} className="bg-slate-800">{m.avatar} {m.name}</option>)}
            </select>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-amber-400 text-slate-900 rounded-2xl font-black text-lg hover:bg-amber-300 transition disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  );
}
