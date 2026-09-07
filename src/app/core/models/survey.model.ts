export interface Option {
  id: string;
  label: string;
}

export const SURVEY_CATEGORIES = [
  'Team Activities',
  'Health & Wellness',
  'Gaming & Entertainment',
  'Education & Learning',
  'Lifestyle & Preference',
  'Technology & Innovation',
] as const;

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

export interface Survey {
  id: string;
  slug: string;
  title: string;
  description: string;
  category?: string;
  endDate?: string;
  status: 'published' | 'draft';
  createdAt: string;
  questions: Question[];
  answers: Record<string, string[]>;
}
