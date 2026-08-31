export interface Option {
  id: string;
  label: string;
}
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
  status: 'published' | 'draft';
  createdAt: string;
  questions: Question[];
  answers: Record<string, string[]>;
}
