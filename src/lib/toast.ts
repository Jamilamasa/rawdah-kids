import { toast } from 'sonner';
import { APIError } from '@/lib/api';

export function showApiErrorToast(error: unknown, fallback?: string) {
  if (error instanceof APIError) {
    if (error.status === 403) {
      toast.error("You don't have permission for this.");
      return;
    }
    if (error.status === 404) {
      toast.error('We could not find what you requested.');
      return;
    }
    if (error.status === 429) {
      toast.error('Too many requests. Please wait and try again.');
      return;
    }
    if (error.status >= 500) {
      toast.error('Something went wrong, try again.');
      return;
    }
    toast.error(error.message || fallback || 'Request failed.');
    return;
  }

  if (error instanceof Error) {
    toast.error(error.message || fallback || 'Request failed.');
    return;
  }

  toast.error(fallback || 'Request failed.');
}

export function showSuccessToast(message: string, description?: string) {
  toast.success(message, description ? { description } : undefined);
}
