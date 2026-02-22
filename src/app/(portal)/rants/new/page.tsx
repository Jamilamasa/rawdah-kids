'use client';
import { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCreateRant } from '@/hooks/useRants';
import { useSessionForm } from '@/hooks/useSessionForm';

const FORM_DEFAULT = { title: '', content: '', password: '' };
const FORM_OMIT = ['password'] as const;

export default function NewRantPage() {
  const router = useRouter();
  const createRant = useCreateRant();
  const [form, setForm, clearForm] = useSessionForm('form:rant-new', FORM_DEFAULT, FORM_OMIT);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    createRant.mutate(
      {
        title: form.title.trim() || undefined,
        content: form.content,
        password: form.password || undefined,
      },
      {
        onSuccess: () => {
          clearForm();
          router.push('/rants');
        },
      }
    );
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/rants"
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Back to journal"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-800">New Rant</h1>
          <p className="text-sm text-gray-500">Write something private.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
        <input
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Title (optional)"
          maxLength={120}
        />
        <textarea
          value={form.content}
          onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
          className="w-full min-h-40 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="What's on your mind?"
          required
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Password lock (optional — keeps entry private)"
        />
        <button
          type="submit"
          disabled={createRant.isPending || !form.content.trim()}
          className="w-full py-2.5 rounded-xl text-white font-semibold disabled:opacity-50"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          {createRant.isPending ? 'Saving...' : 'Save Entry'}
        </button>
      </form>
    </div>
  );
}
