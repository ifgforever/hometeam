'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error || 'Login failed');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-5xl text-center mb-4">🏠</div>
        <h1 className="text-3xl font-black text-white mb-8 text-center">Welcome Back</h1>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-indigo-300 block mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
              placeholder="you@email.com" />
          </div>
          <div>
            <label className="text-sm text-indigo-300 block mb-1">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-amber-400 text-slate-900 rounded-2xl font-bold text-lg hover:bg-amber-300 transition disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="flex flex-col gap-2 text-center mt-6">
          <Link href="/join" className="text-indigo-300 text-sm">Join with invite code</Link>
          <Link href="/register" className="text-indigo-300 text-sm">Create a new family</Link>
        </div>
      </div>
    </div>
  );
}
