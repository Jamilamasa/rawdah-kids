'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizzesApi, hadithsApi } from '@/lib/api';
import { showApiErrorToast } from '@/lib/toast';
import type { QuizAnswer } from '@/types';

export function useMyQuizzes() {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: () => quizzesApi.listMine(),
  });
}

export function useQuiz(type: string, id: string) {
  return useQuery({
    queryKey: ['quiz', type, id],
    queryFn: () => quizzesApi.get(type, id),
    enabled: Boolean(type && id),
  });
}

export function useStartQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: string; id: string }) =>
      quizzesApi.start(type, id).then(() => ({ type, id })),
    onSuccess: ({ type, id }) => {
      void qc.invalidateQueries({ queryKey: ['quiz', type, id] });
      void qc.invalidateQueries({ queryKey: ['quizzes'] });
    },
    onError: (error: Error) => {
      showApiErrorToast(error, 'Could not start the quiz. Please try again.');
    },
  });
}

export function useSubmitQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      id,
      answers,
    }: {
      type: string;
      id: string;
      answers: QuizAnswer[];
    }) => quizzesApi.submit(type, id, answers),
    onSuccess: (result, { type, id }) => {
      void qc.invalidateQueries({ queryKey: ['quiz', type, id] });
      void qc.invalidateQueries({ queryKey: ['quizzes'] });
      void qc.invalidateQueries({ queryKey: ['xp'] });
    },
    onError: (error: Error) => {
      showApiErrorToast(error, 'Could not submit quiz answers. Please try again.');
    },
  });
}

export function useLearnedHadiths() {
  return useQuery({
    queryKey: ['hadiths', 'learned'],
    queryFn: () => hadithsApi.learned(),
  });
}
