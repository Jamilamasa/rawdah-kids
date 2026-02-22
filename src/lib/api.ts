import { useAuthStore } from '@/store/authStore';
import type {
  User,
  Family,
  Task,
  HadithQuiz,
  ProphetQuiz,
  QuranQuiz,
  QuizAnswer,
  Hadith,
  AvailableGame,
  GameSession,
  Message,
  Conversation,
  Rant,
  Request,
  Notification,
  LearnContent,
  UserXP,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/v1';

export class APIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token: string | null = null;
  try {
    token = useAuthStore.getState().accessToken;
  } catch {
    // Not in client context
  }

  const isPublicAuthPath =
    path.startsWith('/auth/') &&
    !path.startsWith('/auth/me') &&
    !path.startsWith('/auth/me/password');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token && !isPublicAuthPath) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (res.status === 401 && !isPublicAuthPath) {
    useAuthStore.getState().clearSession();
    if (typeof window !== 'undefined') window.location.href = '/';
    throw new APIError(401, 'Session expired');
  }

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      message = data.error ?? message;
    } catch {
      // Ignore JSON parse error
    }
    throw new APIError(res.status, message);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// Auth
export const authApi = {
  childSignin: (body: { family_slug: string; username: string; password: string }) =>
    apiFetch<{ user: User; family: Family; access_token: string }>('/auth/child/signin', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  me: () => apiFetch<{ user: User; family: Family }>('/auth/me'),
  signout: () => apiFetch<void>('/auth/signout', { method: 'POST' }),
  changePassword: (body: { current_password: string; new_password: string }) =>
    apiFetch<void>('/auth/me/password', { method: 'PATCH', body: JSON.stringify(body) }),
};

// Tasks
export const tasksApi = {
  list: () => apiFetch<{ tasks: Task[] }>('/tasks'),
  get: (id: string) => apiFetch<Task>(`/tasks/${id}`),
  start: (id: string) => apiFetch<void>(`/tasks/${id}/start`, { method: 'POST' }),
  complete: (id: string) => apiFetch<void>(`/tasks/${id}/complete`, { method: 'POST' }),
  requestReward: (id: string) =>
    apiFetch<void>(`/tasks/${id}/request-reward`, { method: 'POST' }),
};

// Quizzes
export const quizzesApi = {
  listMine: () =>
    apiFetch<{
      hadith_quizzes: HadithQuiz[];
      prophet_quizzes: ProphetQuiz[];
      quran_quizzes: QuranQuiz[];
    }>('/quizzes/my'),
  get: (type: string, id: string) =>
    apiFetch<HadithQuiz | ProphetQuiz | QuranQuiz>(`/quizzes/${type}/${id}`),
  start: (type: string, id: string) =>
    apiFetch<void>(`/quizzes/${type}/${id}/start`, { method: 'POST' }),
  submit: (type: string, id: string, answers: QuizAnswer[]) =>
    apiFetch<HadithQuiz | ProphetQuiz | QuranQuiz>(`/quizzes/${type}/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
};

// Hadiths
export const hadithsApi = {
  learned: () => apiFetch<{ hadiths: Hadith[]; count: number }>('/hadiths/learned'),
};

// Games
export const gamesApi = {
  list: () => apiFetch<{ games: AvailableGame[] }>('/games'),
  startSession: (game_name: string, game_type: string) =>
    apiFetch<GameSession>('/games/sessions/start', {
      method: 'POST',
      body: JSON.stringify({ game_name, game_type }),
    }),
  endSession: (id: string) => apiFetch<GameSession>(`/games/sessions/${id}/end`, { method: 'POST' }),
};

// Messages
export const messagesApi = {
  conversations: () =>
    apiFetch<{ conversations: Conversation[] }>('/messages/conversations'),
  thread: (userId: string) => apiFetch<{ messages: Message[] }>(`/messages/${userId}`),
  send: (recipient_id: string, content: string) =>
    apiFetch<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipient_id, content }),
    }),
  markRead: (id: string) => apiFetch<void>(`/messages/${id}/read`, { method: 'PATCH' }),
};

// Rants
export const rantsApi = {
  list: () => apiFetch<{ rants: Rant[] }>('/rants'),
  get: (id: string, password?: string) => {
    const headers: Record<string, string> = {};
    if (password) headers['X-Rant-Password'] = password;
    return apiFetch<Rant>(`/rants/${id}`, { headers });
  },
  create: (body: { title?: string; content: string; password?: string }) =>
    apiFetch<Rant>('/rants', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: { title?: string; content?: string }) =>
    apiFetch<Rant>(`/rants/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => apiFetch<void>(`/rants/${id}`, { method: 'DELETE' }),
};

// Requests
export const requestsApi = {
  list: () => apiFetch<{ requests: Request[] }>('/requests'),
  create: (body: { title: string; description?: string; target_id?: string }) =>
    apiFetch<Request>('/requests', { method: 'POST', body: JSON.stringify(body) }),
};

// Notifications
export const notificationsApi = {
  list: () => apiFetch<{ notifications: Notification[] }>('/notifications'),
  readAll: () => apiFetch<void>('/notifications/read-all', { method: 'PATCH' }),
  readOne: (id: string) => apiFetch<void>(`/notifications/${id}/read`, { method: 'PATCH' }),
};

// Learn
export const learnApi = {
  listMine: () => apiFetch<{ content: LearnContent[] }>('/learn/my'),
  complete: (id: string) => apiFetch<void>(`/learn/${id}/complete`, { method: 'POST' }),
};

// XP
export const xpApi = {
  get: () => apiFetch<UserXP>('/xp'),
};

// Family
export const familyApi = {
  members: () => apiFetch<{ members: User[] }>('/family/members'),
};
