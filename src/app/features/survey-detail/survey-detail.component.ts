import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';
import { AppHeaderComponent } from '../../shared/components/app-header.component';
@Component({
  imports: [AppHeaderComponent],
  templateUrl: './survey-detail.component.html',
  styleUrl: './survey-detail.component.scss',
})
export class SurveyDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly surveys = inject(SurveyService);
  private readonly selectedOptions = signal<Record<string, string[]>>({});
  readonly survey = computed(() =>
    this.surveys.bySlug(this.route.snapshot.paramMap.get('slug') ?? ''),
  );
  readonly isPastSurvey = computed(() => {
    const endDate = this.survey()?.endDate;
    return !!endDate && new Date(`${endDate}T23:59:59`).getTime() < Date.now();
  });
  vote(surveyId: string, questionId: string, optionId: string) {
    if (this.isPastSurvey()) return;
    const wasSelected = this.isSelected(questionId, optionId);
    this.selectedOptions.update((selected) => {
      const questionOptions = selected[questionId] ?? [];
      const updatedOptions = wasSelected
        ? questionOptions.filter((selectedOption) => selectedOption !== optionId)
        : [...questionOptions, optionId];
      return { ...selected, [questionId]: updatedOptions };
    });
    void (wasSelected
      ? this.surveys.removeAnswer(surveyId, questionId, optionId)
      : this.surveys.addAnswer(surveyId, questionId, optionId));
  }
  isSelected(questionId: string, optionId: string) {
    return this.selectedOptions()[questionId]?.includes(optionId) ?? false;
  }
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
  optionLetter(index: number) {
    return String.fromCharCode(65 + index);
  }
  hasAnswers(answers: Record<string, string[]>) {
    return Object.values(answers).some((questionAnswers) => questionAnswers.length > 0);
  }
  hasQuestionAnswers(answers: Record<string, string[]>, questionId: string) {
    return (answers[questionId]?.length ?? 0) > 0;
  }
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
  completeSurvey() {
    if (this.canComplete()) {
      void this.router.navigate(['/']);
    }
  }
  count(values: string[] | undefined, optionId: string) {
    return values?.filter((value) => value === optionId).length ?? 0;
  }
  percent(values: string[] | undefined, optionId: string) {
    const total = values?.length ?? 0;
    return total ? Math.round((this.count(values, optionId) / total) * 100) : 0;
  }
}
