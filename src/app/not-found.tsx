import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-b from-brand-light to-white">
      <div className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-sm text-center">
        <p className="text-5xl mb-3">🌿</p>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-4">
          The page you requested is not available right now.
        </p>
        <Link
          href="/home"
          className="inline-flex items-center justify-center w-full py-3 rounded-xl text-white font-semibold"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
