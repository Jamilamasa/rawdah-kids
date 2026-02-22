export const dynamic = 'force-static';

import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-green-700 via-green-600 to-emerald-500 p-4 relative overflow-hidden">
      {/* Decorative Islamic patterns */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-8 left-8 text-white/10 text-8xl">☽</div>
        <div className="absolute top-16 right-12 text-white/10 text-6xl">✦</div>
        <div className="absolute bottom-24 left-16 text-white/10 text-7xl">✦</div>
        <div className="absolute bottom-12 right-8 text-white/10 text-9xl">☽</div>
        <div className="absolute top-1/3 left-4 text-white/5 text-[12rem] rotate-12">✦</div>
        <div className="absolute top-1/4 right-0 text-white/5 text-[10rem] -rotate-12">☽</div>
      </div>

      {/* Logo / Title */}
      <div className="mb-8 text-center z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-4 backdrop-blur-sm shadow-lg">
          <span className="text-4xl">🌿</span>
        </div>
        <h1 className="text-4xl font-bold text-white drop-shadow-md">Rawdah Kids</h1>
        <p className="text-green-100 mt-1 text-lg">Your Islamic learning adventure!</p>
      </div>

      {/* Login Card */}
      <LoginForm />
    </main>
  );
}
