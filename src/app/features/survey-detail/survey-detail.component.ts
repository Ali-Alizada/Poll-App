import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';
import { AppHeaderComponent } from '../../shared/components/app-header.component';

@Component({
  imports: [AppHeaderComponent],
  templateUrl: './survey-detail.component.html',
  styleUrls: ['./survey-detail.component.scss', './responsive/survey-detail-responsive.scss'],
})

export class SurveyDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly surveys = inject(SurveyService);
  private readonly selectedOptions = signal<Record<string, string[]>>({});
  readonly survey = computed(() =>
    this.surveys.bySlug(this.route.snapshot.paramMap.get('slug') ?? ''),
  );

  /** Combines persisted answers with the local selection for the live preview. */
  readonly resultAnswers = computed<Record<string, string[]>>(() => {
    const currentSurvey = this.survey();
    if (!currentSurvey) return {};

    const selected = this.selectedOptions();
    return Object.fromEntries(
      currentSurvey.questions.map((question) => [
        question.id,
        [
          ...(currentSurvey.answers[question.id] ?? []),
          ...(selected[question.id] ?? []),
        ],
      ]),
    );
  });

  readonly isPastSurvey = computed(() => {
    const endDate = this.survey()?.endDate;
    return !!endDate && new Date(`${endDate}T23:59:59`).getTime() < Date.now();
  });

  /** Toggles an option and persists the resulting answer.
   * @param surveyId Survey identifier.
   * @param questionId Question identifier.
   * @param optionId Option identifier.
   * @returns Nothing.
   */
  async vote(surveyId: string, questionId: string, optionId: string) {
    if (this.isPastSurvey()) return;
    const question = this.survey()?.questions.find((item) => item.id === questionId);
    if (!question) return;
    const wasSelected = this.isSelected(questionId, optionId);
    if (!question.allowMultiple && wasSelected) return;
    this.updateSelectedOptions(questionId, optionId, question.allowMultiple, wasSelected);
  }

  /** Updates the local selection state for one question.
   * @param questionId Question identifier.
   * @param optionId Option identifier.
   * @param allowMultiple Whether multiple options may be selected.
   * @param wasSelected Whether the option was selected before the vote.
   * @returns Nothing.
   */
  private updateSelectedOptions(
    questionId: string,
    optionId: string,
    allowMultiple: boolean,
    wasSelected: boolean,
  ) {
    this.selectedOptions.update((selected) => {
      const questionOptions = selected[questionId] ?? [];
      const updatedOptions = wasSelected
        ? questionOptions.filter((selectedOption) => selectedOption !== optionId)
        : allowMultiple ? [...questionOptions, optionId] : [optionId];
      return { ...selected, [questionId]: updatedOptions };
    });
  }

  /** Returns whether an option is selected for a question.
   * @param questionId Question identifier.
   * @param optionId Option identifier.
   * @returns True when the option is selected.
   */
  isSelected(questionId: string, optionId: string) {
    return this.selectedOptions()[questionId]?.includes(optionId) ?? false;
  }

  /** Formats an ISO date for display in the German locale.
   * @param date Optional ISO date.
   * @returns Formatted date or the original value.
   */
  formatDate(date: string | undefined) {
    if (!date) return '';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(parsedDate);
  }

  /** Converts an option index to its alphabetic label.
   * @param index Option index.
   * @returns Alphabetic option label.
   */
  optionLetter(index: number) {
    return String.fromCharCode(65 + index);
  }

  /** Returns whether any answer exists in the survey.
   * @param answers Answers grouped by question.
   * @returns True when at least one answer exists.
   */
  hasAnswers(answers: Record<string, string[]>) {
    return Object.values(answers).some((questionAnswers) => questionAnswers.length > 0);
  }

  /** Returns whether a question has at least one answer.
   * @param answers Answers grouped by question.
   * @param questionId Question identifier.
   * @returns True when the question has an answer.
   */
  hasQuestionAnswers(answers: Record<string, string[]>, questionId: string) {
    return (answers[questionId]?.length ?? 0) > 0;
  }

  /** Returns whether every question can be completed.
   * @returns True when all questions have selections.
   */
  canComplete() {
    const currentSurvey = this.survey();
    return (
      !!currentSurvey &&
      !this.isPastSurvey() &&
      currentSurvey.questions.every(
        (question) => (this.selectedOptions()[question.id]?.length ?? 0) > 0,
      )
    );
  }

  /** Submits the local draft answers to Supabase only after final confirmation.
   * @returns Nothing.
   */
  async completeSurvey() {
    const currentSurvey = this.survey();
    if (!currentSurvey || !this.canComplete()) return;
    await this.surveys.submitAnswers(currentSurvey.id, this.selectedOptions());
    await this.router.navigate(['/']);
  }

  /** Counts answers matching one option.
   * @param values Answer option ids.
   * @param optionId Option identifier.
   * @returns Number of matching answers.
   */
  count(values: string[] | undefined, optionId: string) {
    return values?.filter((value) => value === optionId).length ?? 0;
  }

  /** Calculates the percentage for one option.
   * @param values Answer option ids.
   * @param optionId Option identifier.
   * @returns Rounded percentage from zero to one hundred.
   */
  percent(values: string[] | undefined, optionId: string) {
    const total = values?.length ?? 0;
    return total ? Math.round((this.count(values, optionId) / total) * 100) : 0;
  }
}
