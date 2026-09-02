import { Injectable, computed, signal } from '@angular/core';
import { Question, Survey } from '../models/survey.model';
import { supabase } from '../supabase-client';

const TABLES = {
  surveys: 'surveys',
  questions: 'survey_questions',
  options: 'options',
  answers: 'survey_answers',
} as const;

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private readonly state = signal<Survey[]>([]);
  private isSubscribed = false;
  readonly surveys = computed(() => this.state());
  readonly published = computed(() =>
    this.state().filter((survey) => survey.status === 'published'),
  );

  constructor() {
    void this.loadSurveys();
    void this.subscribeToChanges();
  }

  bySlug(slug: string) {
    return this.state().find((survey) => survey.slug === slug);
  }

  async loadSurveys() {
    const [surveysResult, questionsResult, optionsResult, answersResult] = await Promise.all([
      supabase.from(TABLES.surveys).select('*').order('created_at', { ascending: false }),
      supabase.from(TABLES.questions).select('*').order('position'),
      supabase.from(TABLES.options).select('*').order('position'),
      supabase.from(TABLES.answers).select('question_id, option_id'),
    ]);
    const error =
      surveysResult.error || questionsResult.error || optionsResult.error || answersResult.error;
    if (error) {
      console.error('Supabase-Daten konnten nicht geladen werden:', error.message);
      return;
    }

    const questions = questionsResult.data ?? [];
    const options = optionsResult.data ?? [];
    const answers = answersResult.data ?? [];
    this.state.set(
      (surveysResult.data ?? []).map((row): Survey => {
        const surveyQuestions: Question[] = questions
          .filter((question) => question.survey_id === row.id)
          .map((question) => ({
            id: question.id,
            text: question.text,
            options: options
              .filter((option) => option.question_id === question.id)
              .map((option) => ({ id: option.id, label: option.label })),
          }));
        const groupedAnswers: Record<string, string[]> = {};
        answers.forEach((answer) => {
          groupedAnswers[answer.question_id] ??= [];
          groupedAnswers[answer.question_id].push(answer.option_id);
        });
        return {
          id: row.id,
          slug: row.slug,
          title: row.title,
          description: row.description,
          status: row.status,
          createdAt: row.created_at,
          questions: surveyQuestions,
          answers: groupedAnswers,
        };
      }),
    );
  }

  async addAnswer(surveyId: string, questionId: string, optionId: string) {
    const { error } = await supabase
      .from(TABLES.answers)
      .insert({ survey_id: surveyId, question_id: questionId, option_id: optionId });
    if (error) throw error;
    await this.loadSurveys();
  }

  async create(title: string, description: string, questions: Question[]) {
    const slug = `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}-${Date.now().toString().slice(-4)}`;
    const { data: survey, error: surveyError } = await supabase
      .from(TABLES.surveys)
      .insert({ slug, title, description, status: 'published' })
      .select()
      .single();
    if (surveyError) throw surveyError;
    for (let position = 0; position < questions.length; position++) {
      const question = questions[position];
      const { data: savedQuestion, error: questionError } = await supabase
        .from(TABLES.questions)
        .insert({ survey_id: survey.id, text: question.text, position })
        .select()
        .single();
      if (questionError) throw questionError;
      const { error: optionError } = await supabase
        .from(TABLES.options)
        .insert(
          question.options.map((option, optionPosition) => ({
            question_id: savedQuestion.id,
            label: option.label,
            position: optionPosition,
          })),
        );
      if (optionError) throw optionError;
    }
    await this.loadSurveys();
    return this.bySlug(slug)!;
  }

  private async subscribeToChanges() {
    if (this.isSubscribed) return;
    this.isSubscribed = true;

    // Realtime-Abos für alle Tabellen einrichten
    supabase
      .channel('poll-app-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLES.surveys },
        async () => {
          console.log('Survey-Änderung erkannt, Daten werden aktualisiert...');
          await this.loadSurveys();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLES.questions },
        async () => {
          console.log('Frage-Änderung erkannt, Daten werden aktualisiert...');
          await this.loadSurveys();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLES.options },
        async () => {
          console.log('Option-Änderung erkannt, Daten werden aktualisiert...');
          await this.loadSurveys();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLES.answers },
        async () => {
          console.log('Antwort-Änderung erkannt, Daten werden aktualisiert...');
          await this.loadSurveys();
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(' Realtime-Abos erfolgreich aktiviert');
        } else if (status === 'CHANNEL_ERROR') {
          console.error(' Fehler beim Verbinden zu Realtime');
        } else if (status === 'CLOSED') {
          console.warn(' Realtime-Verbindung geschlossen');
        }
      });
  }
}
