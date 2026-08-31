import { Injectable, computed, signal } from '@angular/core';
import { Question, Survey } from '../models/survey.model';
import { supabase } from '../supabase-client';



const initialSurveys: Survey[] = [
  {
    id: 'team-event',
    slug: 'next-team-event',
    title: "Let's Plan the Next Team Event Together!",
    description:
      'We want to plan something everyone enjoys. Vote below and see the results update live.',
    status: 'published',
    createdAt: '2026-08-29',
    questions: [
      {
        id: 'q1',
        text: 'Which date would work best for you?',
        options: [
          { id: 'q1a', label: '15.09.2026, Friday' },
          { id: 'q1b', label: '22.09.2026, Friday' },
          { id: 'q1c', label: '29.09.2026, Friday' },
        ],
      },
      {
        id: 'q2',
        text: 'Choose the activity you prefer.',
        options: [
          { id: 'q2a', label: 'Outdoor adventure' },
          { id: 'q2b', label: 'Cooking class' },
          { id: 'q2c', label: 'Escape room' },
        ],
      },
      {
        id: 'q3',
        text: 'What is most important to you in a team event?',
        options: [
          { id: 'q3a', label: 'Fun and excitement' },
          { id: 'q3b', label: 'Relaxed atmosphere' },
          { id: 'q3c', label: 'Trying something new' },
        ],
      },
    ],
    answers: {
      q1: ['q1a', 'q1a', 'q1b', 'q1a', 'q1c'],
      q2: ['q2b', 'q2b', 'q2a'],
      q3: ['q3a', 'q3c', 'q3a', 'q3b'],
    },
  },
];




@Injectable({ providedIn: 'root' })

export class SurveyService {
  private readonly state = signal<Survey[]>(initialSurveys);
  readonly surveys = computed(() => this.state());
  readonly published = computed(() =>
    this.state().filter((survey) => survey.status === 'published'),
  );
  bySlug(slug: string) {
    return this.state().find((survey) => survey.slug === slug);
  }
  addAnswer(surveyId: string, questionId: string, optionId: string) {
    this.state.update((surveys) =>
      surveys.map((survey) =>
        survey.id !== surveyId
          ? survey
          : {
              ...survey,
              answers: {
                ...survey.answers,
                [questionId]: [...(survey.answers[questionId] ?? []), optionId],
              },
            },
      ),
    );
  }

  async loadSurveys() {
    const { data, error } = await supabase.from('surveys').select('*');
    if (error) throw error;
    return data;
  }

  create(title: string, description: string, questions: Question[]) {
    const slug = `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}-${Date.now().toString().slice(-4)}`;
    const survey: Survey = {
      id: crypto.randomUUID(),
      slug,
      title,
      description,
      status: 'published',
      createdAt: new Date().toISOString(),
      questions,
      answers: {},
    };
    this.state.update((surveys) => [survey, ...surveys]);
    return survey;
  }
}
