export type UserRole = 'parent' | 'child' | 'adult_relative';
export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'reward_requested'
  | 'reward_approved'
  | 'reward_declined';
export type QuizStatus = 'pending' | 'memorizing' | 'in_progress' | 'completed';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type TopicCategory =
  | 'hadith'
  | 'quran'
  | 'science'
  | 'fun_facts'
  | 'custom'
  | 'general';
export type Theme =
  | 'forest'
  | 'ocean'
  | 'sunset'
  | 'midnight'
  | 'desert'
  | 'candy'
  | 'sky'
  | 'volcano'
  | 'arctic'
  | 'gold';
export type RequestStatus = 'pending' | 'approved' | 'declined';

export interface Family {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  plan: 'free' | 'pro';
  created_at: string;
}

export interface User {
  id: string;
  family_id: string;
  role: UserRole;
  name: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  theme: Theme;
  game_limit_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface AuthSession {
  user: User;
  family: Family;
  access_token: string;
}

export interface Task {
  id: string;
  family_id: string;
  title: string;
  description?: string;
  assigned_to: string;
  created_by: string;
  reward_id?: string;
  status: TaskStatus;
  due_date?: string;
  completed_at?: string;
  created_at: string;
}

export interface Reward {
  id: string;
  family_id: string;
  title: string;
  description?: string;
  value: number;
  type: 'virtual' | 'real' | 'monetary';
  icon?: string;
  created_by: string;
  created_at: string;
}

export interface DueReward {
  task_id: string;
  task_title: string;
  task_description?: string;
  task_status: Extract<TaskStatus, 'reward_requested' | 'reward_approved'>;
  task_due_date?: string;
  task_completed_at?: string;
  task_created_at: string;
  child_id: string;
  child_name: string;
  reward_id: string;
  reward_title: string;
  reward_description?: string;
  reward_value: number;
  reward_type: 'virtual' | 'real' | 'monetary';
  reward_icon?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface QuizAnswer {
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface HadithQuiz {
  id: string;
  family_id: string;
  hadith_id: string;
  assigned_to: string;
  assigned_by: string;
  questions: QuizQuestion[];
  answers?: QuizAnswer[];
  score?: number;
  xp_awarded: number;
  status: QuizStatus;
  memorize_until?: string;
  completed_at?: string;
  created_at: string;
}

export interface ProphetQuiz {
  id: string;
  family_id: string;
  prophet_id: string;
  assigned_to: string;
  assigned_by: string;
  questions: QuizQuestion[];
  answers?: QuizAnswer[];
  score?: number;
  xp_awarded: number;
  status: QuizStatus;
  completed_at?: string;
  created_at: string;
}

export interface QuranQuiz {
  id: string;
  family_id: string;
  verse_id: string;
  lesson_id?: string;
  assigned_to: string;
  questions: QuizQuestion[];
  answers?: QuizAnswer[];
  score?: number;
  xp_awarded: number;
  status: QuizStatus;
  completed_at?: string;
  created_at: string;
}

export interface TopicQuiz {
  id: string;
  family_id: string;
  assigned_to: string;
  assigned_by: string;
  category: TopicCategory;
  topic: string;
  lesson_content: string;
  flashcards: Flashcard[];
  questions: QuizQuestion[];
  answers?: QuizAnswer[];
  score?: number;
  xp_awarded: number;
  status: QuizStatus;
  completed_at?: string;
  created_at: string;
}

export interface Hadith {
  id: string;
  text_en: string;
  text_ar?: string;
  source: string;
  topic?: string;
  difficulty: Difficulty;
  created_at: string;
}

export interface Prophet {
  id: string;
  name_en: string;
  name_ar?: string;
  order_num?: number;
  story_summary: string;
  key_miracles?: string;
  nation?: string;
  quran_refs?: string;
  difficulty: Difficulty;
  created_at: string;
}

export interface QuranVerse {
  id: string;
  surah_number: number;
  ayah_number: number;
  surah_name_en: string;
  text_ar: string;
  text_en: string;
  transliteration?: string;
  tafsir_simple: string;
  life_application?: string;
  topic?: string;
  difficulty: Difficulty;
  created_at: string;
}

export interface QuranLesson {
  id: string;
  family_id: string;
  verse_id: string;
  assigned_to: string;
  assigned_by: string;
  reward_id?: string;
  status: 'pending' | 'reading' | 'completed';
  completed_at?: string;
  created_at: string;
}

export interface LearnContent {
  id: string;
  family_id: string;
  assigned_to?: string;
  title: string;
  content_type: 'text' | 'link' | 'video' | 'pdf';
  content: string;
  reward_id?: string;
  created_by: string;
  created_at: string;
}

export interface Message {
  id: string;
  family_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read_at?: string;
  created_at: string;
}

export interface Rant {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  is_locked: boolean;
  created_at: string;
}

export interface Request {
  id: string;
  family_id: string;
  requester_id: string;
  target_id?: string;
  title: string;
  description?: string;
  status: RequestStatus;
  response_message?: string;
  responded_by?: string;
  responded_at?: string;
  created_at: string;
}

export interface DuaSelectedName {
  transliteration: string;
  dua_form: string;
  arabic: string;
  meaning: string;
  explanation: string;
}

export interface DuaGenerateInput {
  asking_for: string;
  heavy_on_heart: string;
  afraid_of: string;
  if_answered: string;
  output_style: string;
  depth: string;
  tone: string;
}

export interface DuaGenerateResponse {
  selected_names: DuaSelectedName[];
  dua_text: string;
}

export interface DuaHistoryEntry extends DuaGenerateInput, DuaGenerateResponse {
  id: string;
  family_id: string;
  user_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface UserXP {
  id: string;
  user_id: string;
  family_id: string;
  total_xp: number;
  level: number;
  updated_at: string;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}

export interface GameSession {
  id: string;
  user_id: string;
  family_id: string;
  game_name: string;
  game_type: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
}

export interface AvailableGame {
  id: string;
  name: string;
  type: 'islamic' | 'general';
  icon: string;
  description: string;
}

export interface WSEvent {
  type: string;
  payload: unknown;
}

export interface LevelInfo {
  level: number;
  xp: number;
  title: string;
}

export const LEVEL_THRESHOLDS: LevelInfo[] = [
  { level: 1, xp: 0, title: 'Seedling' },
  { level: 2, xp: 100, title: 'Sprout' },
  { level: 3, xp: 300, title: 'Learner' },
  { level: 4, xp: 600, title: 'Explorer' },
  { level: 5, xp: 1000, title: 'Scholar' },
  { level: 6, xp: 1500, title: 'Hadith Student' },
  { level: 7, xp: 2500, title: 'Quran Reader' },
  { level: 8, xp: 4000, title: 'Prophet Historian' },
  { level: 9, xp: 6000, title: 'Knowledge Seeker' },
  { level: 10, xp: 10000, title: 'Garden Master' },
];

export interface Conversation {
  user: User;
  last_message: Message;
  unread_count: number;
}
