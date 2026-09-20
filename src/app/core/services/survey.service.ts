import { Injectable, computed, signal } from '@angular/core';
import { Question, Survey } from '../models/survey.model';
import { supabase } from '../supabase-client';

const TABLES = {
  surveys: 'surveys',
  questions: 'survey_questions',
  options: 'options',
  answers: 'survey_answers',
} as const;

type SurveyRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category?: string | null;
  end_date?: string | null;
  status: 'published' | 'draft';
  created_at: string;
};

type QuestionRow = { id: string; survey_id: string; text: string };
type OptionRow = { id: string; question_id: string; label: string };
type AnswerRow = { survey_id: string; question_id: string; option_id: string };

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private readonly state = signal<Survey[]>([]);
  private isSubscribed = false;
  readonly surveys = computed(() => this.state());
  readonly published = computed(() =>
    this.state().filter((survey) => survey.status === 'published'),
  );

  /** Creates the service and starts initial loading plus realtime updates. */
  constructor() {
    void this.loadSurveys();
    void this.subscribeToChanges();
  }

  /** Returns the survey matching the given slug.
   * @param slug Survey URL slug.
   * @returns The matching survey or undefined.
   */
  bySlug(slug: string) {
    return this.state().find((survey) => survey.slug === slug);
  }

  /** Loads all survey data and replaces the local state.
   * @returns A promise resolved after the state update.
   */
  async loadSurveys() {
    const results = await this.fetchSurveyData();
    const [surveysResult, questionsResult, optionsResult, answersResult] = results;
    const error =
      surveysResult.error || questionsResult.error || optionsResult.error || answersResult.error;
    if (error) return;
    this.state.set(this.mapSurveys(results));
  }

  /** Fetches the four related tables needed to build the survey state.
   * @returns The four related database query results.
   */
  private fetchSurveyData() {
    return Promise.all([
      supabase.from(TABLES.surveys).select('*').order('created_at', { ascending: false }),
      supabase.from(TABLES.questions).select('*').order('position'),
      supabase.from(TABLES.options).select('*').order('position'),
      supabase.from(TABLES.answers).select('survey_id, question_id, option_id'),
    ]);
  }

  /** Converts the database results into domain surveys.
   * @param results Database results for surveys and related records.
   * @returns The mapped domain surveys.
   */
  private mapSurveys(results: Awaited<ReturnType<typeof this.fetchSurveyData>>) {
    const [surveys, questions, options, answers] = results;
    return (surveys.data as SurveyRow[] ?? []).map((survey) =>
      this.mapSurvey(survey, questions.data as QuestionRow[] ?? [], options.data as OptionRow[] ?? [], answers.data as AnswerRow[] ?? []),
    );
  }

  /** Maps one database survey row and its related records.
   * @param row Database survey row.
   * @param questions Database question rows.
   * @param options Database option rows.
   * @param answers Database answer rows.
   * @returns The mapped survey.
   */
  private mapSurvey(
    row: SurveyRow,
    questions: QuestionRow[],
    options: OptionRow[],
    answers: AnswerRow[],
  ): Survey {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      category: row.category ?? undefined,
      endDate: row.end_date ?? undefined,
      status: row.status,
      createdAt: row.created_at,
      questions: this.mapQuestions(row.id, questions, options),
      answers: this.groupAnswers(row.id, answers),
    };
  }

  /** Builds the questions and options belonging to one survey.
   * @param surveyId Survey identifier.
   * @param questions Database question rows.
   * @param options Database option rows.
   * @returns The mapped survey questions.
   */
  private mapQuestions(surveyId: string, questions: QuestionRow[], options: OptionRow[]) {
    return questions.filter((question) => question.survey_id === surveyId).map((question) => ({
      id: question.id,
      text: question.text,
      options: options
        .filter((option) => option.question_id === question.id)
        .map((option) => ({ id: option.id, label: option.label })),
    }));
  }

  /** Groups answer option ids by question for one survey.
   * @param surveyId Survey identifier.
   * @param answers Database answer rows.
   * @returns Answer option ids grouped by question.
   */
  private groupAnswers(surveyId: string, answers: AnswerRow[]) {
    const grouped: Record<string, string[]> = {};
    answers
      .filter((answer) => answer.survey_id === surveyId)
      .forEach((answer) => (grouped[answer.question_id] ??= []).push(answer.option_id));
    return grouped;
  }

  /** Persists one selected answer and refreshes the local state.
   * @param surveyId Survey identifier.
   * @param questionId Question identifier.
   * @param optionId Option identifier.
   * @returns A promise resolved after the state refresh.
   */
  async addAnswer(surveyId: string, questionId: string, optionId: string) {
    const { error } = await supabase
      .from(TABLES.answers)
      .insert({ survey_id: surveyId, question_id: questionId, option_id: optionId });
    if (error) throw error;
    await this.loadSurveys();
  }

  /** Removes one selected answer and refreshes the local state.
   * @param surveyId Survey identifier.
   * @param questionId Question identifier.
   * @param optionId Option identifier.
   * @returns A promise resolved after the state refresh.
   */
  async removeAnswer(surveyId: string, questionId: string, optionId: string) {
    const { data: answer, error: findError } = await supabase
      .from(TABLES.answers)
      .select('id')
      .eq('survey_id', surveyId)
      .eq('question_id', questionId)
      .eq('option_id', optionId)
      .limit(1)
      .maybeSingle();
    if (findError) throw findError;
    if (answer) {
      const { error } = await supabase.from(TABLES.answers).delete().eq('id', answer.id);
      if (error) throw error;
    }
    await this.loadSurveys();
  }

  /** Creates a published survey with all questions and options.
   * @param title Survey title.
   * @param endDate Optional survey end date.
   * @param description Survey description.
   * @param category Survey category.
   * @param questions Questions and options to persist.
   * @returns The created survey after reloading the state.
   */
  async create(
    title: string,
    endDate: string | undefined,
    description: string,
    category: string,
    questions: Question[],
  ) {
    const slug = this.createSlug(title);
    const survey = await this.insertSurvey(slug, title, endDate, description, category);
    for (const [position, question] of questions.entries()) {
      await this.saveQuestion(survey.id, question, position);
    }
    await this.loadSurveys();
    return this.bySlug(slug)!;
  }

  /** Creates a stable URL slug for a survey title.
   * @param title Survey title.
   * @returns The generated URL slug.
   */
  private createSlug(title: string) {
    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `${normalizedTitle}-${Date.now().toString().slice(-4)}`;
  }

  /** Inserts the survey and retries for older database schemas.
   * @param slug Survey URL slug.
   * @param title Survey title.
   * @param endDate Optional survey end date.
   * @param description Survey description.
   * @param category Survey category.
   * @returns The inserted survey row.
   */
  private async insertSurvey(
    slug: string,
    title: string,
    endDate: string | undefined,
    description: string,
    category: string,
  ) {
    const result = await supabase.from(TABLES.surveys).insert({
      slug, title, description, category, end_date: endDate || null, status: 'published',
    }).select().single();
    if (!result.error) return result.data;
    return this.insertLegacySurvey(result.error, slug, title, description, category);
  }

  /** Retries survey creation without columns absent from older schemas.
   * @param error Initial database error.
   * @param slug Survey URL slug.
   * @param title Survey title.
   * @param description Survey description.
   * @param category Survey category.
   * @returns The inserted survey row.
   */
  private async insertLegacySurvey(
    error: { message: string },
    slug: string,
    title: string,
    description: string,
    category: string,
  ) {
    if (!error.message.includes("Could not find the 'end_date' column") &&
        !error.message.includes("Could not find the 'category' column")) {
      throw error;
    }
    const result = error.message.includes("Could not find the 'end_date' column")
      ? await supabase.from(TABLES.surveys)
        .insert({ slug, title, description, category, status: 'published' }).select().single()
      : await supabase.from(TABLES.surveys)
        .insert({ slug, title, description, status: 'published' }).select().single();
    if (result.error) throw result.error;
    return result.data;
  }

  /** Persists one question together with its options.
   * @param surveyId Survey identifier.
   * @param question Question and options to persist.
   * @param position Question position.
   * @returns A promise resolved after saving the question and options.
   */
  private async saveQuestion(surveyId: string, question: Question, position: number) {
    const result = await supabase.from(TABLES.questions)
      .insert({ survey_id: surveyId, text: question.text, position }).select().single();
    if (result.error) throw result.error;
    await this.saveOptions(result.data.id, question.options);
  }

  /** Persists the options belonging to one question.
   * @param questionId Question identifier.
   * @param options Options to persist.
   * @returns A promise resolved after saving the options.
   */
  private async saveOptions(questionId: string, options: Question['options']) {
    const result = await supabase.from(TABLES.options).insert(
      options.map((option, position) => ({ question_id: questionId, label: option.label, position })),
    );
    if (result.error) throw result.error;
  }

  /** Subscribes once to changes in every survey-related table.
   * @returns A promise resolved after the subscription is configured.
   */
  private async subscribeToChanges() {
    if (this.isSubscribed) return;
    this.isSubscribed = true;
    const channel = supabase.channel('poll-app-changes');
    Object.values(TABLES).forEach((table) => this.registerRealtimeTable(channel, table));
    channel.subscribe();
  }

  /** Registers a reload callback for one database table.
   * @param channel Supabase realtime channel.
   * @param table Database table name.
  * @returns Nothing.
   */
  private registerRealtimeTable(channel: ReturnType<typeof supabase.channel>, table: string) {
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, async () => {
      await this.loadSurveys();
    });
  }
}
