'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl mb-4">🏠</div>
      <h1 className="text-5xl font-black text-white mb-3">HomeTeam</h1>
      <p className="text-lg text-indigo-200 mb-10 max-w-sm">Turn household chores into a family game. Earn points, build streaks, claim your spot on the leaderboard.</p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link href="/register" className="w-full py-4 bg-amber-400 text-slate-900 rounded-2xl font-bold text-lg hover:bg-amber-300 transition">
          Create a Family
        </Link>
        <Link href="/join" className="w-full py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition">
          Join with Invite Code
        </Link>
        <Link href="/login" className="w-full py-4 text-indigo-300 font-semibold hover:text-white transition">
          Already have an account? Sign in
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-6 max-w-sm w-full">
        {[['🔥', 'Streaks'], ['🏆', 'Leaderboard'], ['🎖️', 'Badges']].map(([icon, label]) => (
          <div key={label} className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-3xl mb-1">{icon}</div>
            <div className="text-xs text-indigo-300 font-semibold">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
