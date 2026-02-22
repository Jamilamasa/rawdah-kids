import { PageHeader } from '@/components/shared/PageHeader';

export const dynamic = 'force-static';

const pages = [
  {
    title: 'Home',
    detail: 'Your welcome screen with progress, motivation, pending tasks, and quiz highlights.',
  },
  {
    title: 'Tasks',
    detail: 'See your assignments, mark progress, and request rewards after completion.',
  },
  {
    title: 'Quizzes',
    detail: 'Learn and quiz in one place with hadith, prophet, Quran, and topic learning packs (lesson + flashcards + quiz). You can self-start hadith quizzes too.',
  },
  {
    title: 'Games',
    detail: 'Play approved games within the time limits set by your family.',
  },
  {
    title: 'AI Helper',
    detail: 'Ask questions and get kid-friendly answers based on your age.',
  },
  {
    title: 'Messages',
    detail: 'Chat with family members for support, updates, and encouragement.',
  },
  {
    title: 'Journal',
    detail: 'Private reflection space to write your thoughts and feelings.',
  },
  {
    title: 'Requests',
    detail: 'Ask for help, permissions, or support and track replies.',
  },
  {
    title: 'Notifications',
    detail: 'Stay updated when new tasks, quizzes, or messages arrive.',
  },
];

const tips = [
  'Check Home first so you know what to focus on today.',
  'Finish pending tasks before starting new games.',
  'When taking quizzes, read each question carefully before choosing an answer.',
  'Use Messages and Requests when you need help instead of guessing.',
  'Keep your Journal honest and respectful; it is your personal reflection space.',
];

export default function InstructionsPage() {
  return (
    <div className="px-4 py-4 space-y-4">
      <PageHeader
        title="Instructions"
        subtitle="How to use your Rawdah kids portal step by step."
      />

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-800">What This App Is For</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Rawdah Kids helps you grow in deen and character through daily routines, Islamic learning,
          quizzes, and healthy communication with your family.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-800">Pages and Features</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {pages.map((page) => (
            <div key={page.title} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <h3 className="text-sm font-semibold text-gray-800">{page.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">{page.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-800">Daily Routine Suggestion</h2>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-gray-600">
          <li>Open Home and review your tasks/quizzes.</li>
          <li>Complete your highest-priority task first.</li>
          <li>Do one learning activity from Quizzes (lesson + flashcards + quiz).</li>
          <li>Use AI Helper when you need a quick explanation, then confirm with a parent.</li>
          <li>Send updates or questions through Messages/Requests.</li>
          <li>Use Journal to reflect before ending your day.</li>
        </ol>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-800">Helpful Tips</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-600">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
