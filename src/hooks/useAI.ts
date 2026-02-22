'use client';

import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { showApiErrorToast } from '@/lib/toast';

export function useAskAI() {
  return useMutation({
    mutationFn: (question: string) => aiApi.ask({ question }),
    onError: (error) => {
      showApiErrorToast(error, 'I could not answer that just now. Try again in a moment.');
    },
  });
}
