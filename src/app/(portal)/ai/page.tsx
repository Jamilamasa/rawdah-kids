'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';
import {
  Bot,
  Loader2,
  MessageSquareText,
  Send,
  Sparkles,
  TextQuote,
  X,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useSessionForm } from '@/hooks/useSessionForm';
import { useAskAI, useDuaHistory, useDuaHistoryItem, useGenerateDua } from '@/hooks/useAI';
import { showSuccessToast } from '@/lib/toast';
import { formatDate } from '@/lib/utils';
import type { DuaGenerateInput, DuaGenerateResponse } from '@/types';

type Message = {
  id: string;
  question: string;
  answer: string;
};

type ActiveModal = 'assistant' | 'dua' | null;

const quickPrompts = [
  'Explain why salah is important.',
  'Tell me a fun science fact about space.',
  'Teach me one hadith in simple words.',
  'Help me plan my homework today.',
];

const duaOutputStyles = ['One full du\'a', "Two to three distinct du'as", "A staged du'a journey"];
const duaDepthLevels = ['Short', 'Medium', 'Detailed', 'Very detailed'];
const duaTones = ['Soft and hopeful', 'Deep and emotional', 'Direct and vulnerable', 'Steady and certain'];

const initialDuaForm: DuaGenerateInput = {
  asking_for: '',
  heavy_on_heart: '',
  afraid_of: '',
  if_answered: '',
  output_style: duaOutputStyles[0],
  depth: 'Medium',
  tone: duaTones[0],
};

function LauncherCard({
  title,
  description,
  icon,
  actionLabel,
  onClick,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:shadow"
    >
      <div className="mb-3 inline-flex rounded-xl border border-gray-200 bg-gray-50 p-2 text-gray-700">
        {icon}
      </div>
      <p className="text-lg font-semibold text-gray-800">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <span className="mt-4 inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white">
        {actionLabel}
      </span>
    </button>
  );
}

function FullscreenModal({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 p-4 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="mx-auto flex h-[92vh] max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

export default function AIPage() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const [form, setForm, clearForm] = useSessionForm('form:kids-ai', { question: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const askAI = useAskAI();

  const [duaForm, setDuaForm, clearDuaForm] = useSessionForm('form:kids-dua', initialDuaForm);
  const [latestDua, setLatestDua] = useState<DuaGenerateResponse | null>(null);
  const [selectedHistoryID, setSelectedHistoryID] = useState<string | null>(null);
  const generateDua = useGenerateDua();
  const duaHistory = useDuaHistory(20);
  const duaHistoryItem = useDuaHistoryItem(selectedHistoryID);

  useEffect(() => {
    if (!selectedHistoryID && duaHistory.data && duaHistory.data.length > 0) {
      setSelectedHistoryID(duaHistory.data[0].id);
    }
  }, [duaHistory.data, selectedHistoryID]);

  useEffect(() => {
    if (!activeModal) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [activeModal]);

  const canSubmit = form.question.trim().length >= 2 && !askAI.isPending;
  const canGenerateDua =
    duaForm.asking_for.trim().length >= 2 &&
    duaForm.heavy_on_heart.trim().length >= 2 &&
    duaForm.afraid_of.trim().length >= 2 &&
    duaForm.if_answered.trim().length >= 2 &&
    !generateDua.isPending;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const question = form.question.trim();
    if (question.length < 2 || askAI.isPending) return;

    setPendingQuestion(question);
    askAI.mutate(question, {
      onSuccess: ({ answer }) => {
        setMessages((prev) => [{ id: `${Date.now()}`, question, answer }, ...prev]);
        setPendingQuestion(null);
        clearForm();
        showSuccessToast('Answer ready!', 'You can ask another question anytime.');
      },
      onError: () => {
        setPendingQuestion(null);
      },
    });
  };

  const handleGenerateDua = (event: FormEvent) => {
    event.preventDefault();
    if (!canGenerateDua) return;

    generateDua.mutate(
      {
        asking_for: duaForm.asking_for.trim(),
        heavy_on_heart: duaForm.heavy_on_heart.trim(),
        afraid_of: duaForm.afraid_of.trim(),
        if_answered: duaForm.if_answered.trim(),
        output_style: duaForm.output_style,
        depth: duaForm.depth,
        tone: duaForm.tone,
      },
      {
        onSuccess: (result) => {
          setLatestDua(result);
          clearDuaForm();
          void duaHistory.refetch();
        },
      }
    );
  };

  return (
    <div className="space-y-4 px-4 py-4">
      <PageHeader title="AI Tools" subtitle="Pick one: helper chat or dua generator." />

      <div className="grid gap-3 sm:grid-cols-2">
        <LauncherCard
          title="AI Helper"
          description="Ask questions and learn in a safe way."
          icon={<MessageSquareText size={20} />}
          actionLabel="Open AI Helper"
          onClick={() => setActiveModal('assistant')}
        />
        <LauncherCard
          title="Dua Generator"
          description="Write what is on your heart and generate a full dua."
          icon={<TextQuote size={20} />}
          actionLabel="Open Dua Generator"
          onClick={() => setActiveModal('dua')}
        />
      </div>

      <FullscreenModal
        open={activeModal === 'assistant'}
        title="AI Helper"
        subtitle="Ask your question in this workspace."
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-4">
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
      </FullscreenModal>

      <FullscreenModal
        open={activeModal === 'dua'}
        title="Dua Generator"
        subtitle="Generate and review full dua responses."
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles size={14} />
              Dua generator form
            </div>
            <form onSubmit={handleGenerateDua} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                What are you asking Allah for?
                <textarea
                  rows={3}
                  value={duaForm.asking_for}
                  onChange={(event) => setDuaForm((prev) => ({ ...prev, asking_for: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                What feels heavy on your heart?
                <textarea
                  rows={3}
                  value={duaForm.heavy_on_heart}
                  onChange={(event) =>
                    setDuaForm((prev) => ({ ...prev, heavy_on_heart: event.target.value }))
                  }
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                What are you afraid of?
                <textarea
                  rows={3}
                  value={duaForm.afraid_of}
                  onChange={(event) => setDuaForm((prev) => ({ ...prev, afraid_of: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                If Allah answers, what will life look like?
                <textarea
                  rows={3}
                  value={duaForm.if_answered}
                  onChange={(event) => setDuaForm((prev) => ({ ...prev, if_answered: event.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-sm font-medium text-gray-700">
                  Output style
                  <select
                    value={duaForm.output_style}
                    onChange={(event) =>
                      setDuaForm((prev) => ({ ...prev, output_style: event.target.value }))
                    }
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {duaOutputStyles.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Depth
                  <select
                    value={duaForm.depth}
                    onChange={(event) => setDuaForm((prev) => ({ ...prev, depth: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {duaDepthLevels.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Tone
                  <select
                    value={duaForm.tone}
                    onChange={(event) => setDuaForm((prev) => ({ ...prev, tone: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {duaTones.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="submit"
                disabled={!canGenerateDua}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {generateDua.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                {generateDua.isPending ? 'Generating dua...' : 'Generate dua'}
              </button>
            </form>
          </section>

          {latestDua ? (
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                Latest generated response
              </p>
              {latestDua.selected_names.length > 0 ? (
                <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
                    Selected names
                  </p>
                  <ol className="mt-2 ml-5 list-decimal space-y-2">
                    {latestDua.selected_names.map((name) => (
                      <li key={`${name.dua_form}-${name.arabic}`} className="text-sm">
                        <p className="font-bold text-emerald-900">
                          {name.dua_form} ({name.transliteration}) - {name.meaning}
                        </p>
                        <p className="text-emerald-800">{name.explanation}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
                  Full dua text
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-emerald-900">
                  {latestDua.dua_text}
                </p>
              </div>
            </section>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Dua history</p>
              {duaHistory.isLoading ? (
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 size={14} className="animate-spin" />
                  Loading history...
                </p>
              ) : duaHistory.data && duaHistory.data.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {duaHistory.data.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setSelectedHistoryID(entry.id)}
                      className={`w-full rounded-xl border px-3 py-2 text-left ${
                        selectedHistoryID === entry.id
                          ? 'border-primary/40 bg-primary/10'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-800">{entry.asking_for}</p>
                      <p className="text-xs text-gray-500">{formatDate(entry.created_at)}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-600">No dua history yet.</p>
              )}
            </section>

            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                Full history response
              </p>
              {selectedHistoryID ? (
                duaHistoryItem.isLoading ? (
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 size={14} className="animate-spin" />
                    Loading full dua...
                  </p>
                ) : duaHistoryItem.data ? (
                  <div className="mt-2 space-y-3">
                    {duaHistoryItem.data.selected_names.length > 0 ? (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
                          Selected names
                        </p>
                        <ol className="mt-2 ml-5 list-decimal space-y-2">
                          {duaHistoryItem.data.selected_names.map((name) => (
                            <li key={`${name.dua_form}-${name.arabic}`} className="text-sm">
                              <p className="font-bold text-emerald-900">
                                {name.dua_form} ({name.transliteration}) - {name.meaning}
                              </p>
                              <p className="text-emerald-800">{name.explanation}</p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : null}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
                        Full dua text
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-emerald-900">
                        {duaHistoryItem.data.dua_text}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-600">Could not load this dua entry.</p>
                )
              ) : (
                <p className="mt-2 text-sm text-gray-600">Select a history item to read the full dua.</p>
              )}
            </section>
          </div>
        </div>
      </FullscreenModal>
    </div>
  );
}
