'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AVATARS = ['🙂','👦','👧','👨','👩','🧒','🧑','👶','🧓','😎'];

export default function JoinPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState('🙂');
  const [form, setForm] = useState({ name: '', email: '', password: '', inviteCode: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, avatar }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black text-white mb-1 text-center">Join Your Family</h1>
        <p className="text-indigo-300 text-center mb-8">Enter the invite code from your parent</p>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-indigo-300 block mb-1">Invite Code</label>
            <input type="text" value={form.inviteCode} onChange={e => setForm({ ...form, inviteCode: e.target.value.toUpperCase() })} required
              maxLength={6} placeholder="ABC123"
              className="w-full px-4 py-3 bg-amber-400/20 border border-amber-400/50 rounded-xl text-amber-300 placeholder-amber-300/50 focus:outline-none focus:border-amber-400 text-center text-2xl font-bold tracking-widest uppercase" />
          </div>

          <div>
            <label className="text-sm text-indigo-300 block mb-2">Pick your avatar</label>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map(a => (
                <button type="button" key={a} onClick={() => setAvatar(a)}
                  className={`text-2xl p-2 rounded-xl transition ${avatar === a ? 'bg-amber-400 scale-110' : 'bg-white/10 hover:bg-white/20'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {[
            { name: 'name', label: 'Your Name', placeholder: 'Your name', type: 'text' },
            { name: 'email', label: 'Email', placeholder: 'you@email.com', type: 'email' },
            { name: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
          ].map(field => (
            <div key={field.name}>
              <label className="text-sm text-indigo-300 block mb-1">{field.label}</label>
              <input type={field.type} placeholder={field.placeholder}
                value={(form as any)[field.name]}
                onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400" />
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-amber-400 text-slate-900 rounded-2xl font-bold text-lg hover:bg-amber-300 transition disabled:opacity-50">
            {loading ? 'Joining...' : 'Join Family'}
          </button>
        </form>
        <p className="text-center text-indigo-300 mt-6 text-sm">
          <Link href="/login" className="text-amber-400 font-semibold">Already joined? Sign in</Link>
        </p>
      </div>
    </div>
  );
}
