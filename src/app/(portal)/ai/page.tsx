'use client';

import { FormEvent, useState } from 'react';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useSessionForm } from '@/hooks/useSessionForm';
import { useAskAI } from '@/hooks/useAI';
import { showSuccessToast } from '@/lib/toast';

type Message = {
  id: string;
  question: string;
  answer: string;
};

const quickPrompts = [
  'Explain why salah is important.',
  'Tell me a fun science fact about space.',
  'Teach me one hadith in simple words.',
  'Help me plan my homework today.',
];

export default function AIPage() {
  const [form, setForm, clearForm] = useSessionForm('form:kids-ai', { question: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const askAI = useAskAI();

  const canSubmit = form.question.trim().length >= 2 && !askAI.isPending;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const question = form.question.trim();
    if (question.length < 2 || askAI.isPending) return;

    setPendingQuestion(question);
    askAI.mutate(question, {
      onSuccess: ({ answer }) => {
        setMessages((prev) => [
          {
            id: `${Date.now()}`,
            question,
            answer,
          },
          ...prev,
        ]);
        setPendingQuestion(null);
        clearForm();
        showSuccessToast('Answer ready!', 'You can ask another question anytime.');
      },
      onError: () => {
        setPendingQuestion(null);
      },
    });
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <PageHeader title="AI Helper" subtitle="Ask a question and learn something new." />

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
          <Sparkles size={14} />
          Kid-safe learning assistant
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={4}
            value={form.question}
            onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
            placeholder="Ask anything... e.g. Why do we say Bismillah?"
            className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, question: prompt }))}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
              >
                {prompt}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            {askAI.isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {askAI.isPending ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>
      </section>

      {pendingQuestion ? (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Your question</p>
          <p className="mt-1 text-sm font-medium text-gray-800">{pendingQuestion}</p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-gray-600">
            <Loader2 size={14} className="animate-spin" />
            Getting your answer...
          </p>
        </section>
      ) : null}

      {messages.length ? (
        <div className="space-y-3">
          {messages.map((entry) => (
            <section key={entry.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Question</p>
              <p className="mt-1 text-sm font-medium text-gray-800">{entry.question}</p>

              <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-indigo-700">AI answer</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-indigo-900">{entry.answer}</p>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bot size={26} />}
          title="No AI chats yet"
          description="Ask your first question and start learning."
        />
      )}
    </div>
  );
}
