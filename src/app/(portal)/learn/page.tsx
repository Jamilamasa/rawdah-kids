import { BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';

export default function LearnPage() {
  return (
    <div className="px-4 py-4">
      <PageHeader title="Learn" subtitle="Bitesize Islamic lessons and resources." />
      <EmptyState
        icon={<BookOpen className="w-12 h-12 text-brand-primary" />}
        title="Learning content is coming soon"
        description="Your family will be able to assign lessons here."
      />
    </div>
  );
}
