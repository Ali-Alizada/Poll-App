import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SURVEY_CATEGORIES } from '../../core/models/survey.model';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyEditorModalService } from '../../shared/services/survey-editor-modal.service';

@Component({
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', './responsive/home-responsive.scss'],
})

export class HomeComponent {
  readonly surveys = inject(SurveyService);
  private readonly editorModal = inject(SurveyEditorModalService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  readonly categories = SURVEY_CATEGORIES;
  readonly selectedCategory = signal<string | null>(null);
  readonly isCategoryMenuOpen = signal(false);
  readonly surveyFilter = signal<'active' | 'past'>('active');
  readonly newestSurveys = computed(() =>
    this.surveys
      .published()
      .filter((survey) => this.isActiveSurvey(survey))
      .sort((first, second) => this.endDateTimestamp(first.endDate) - this.endDateTimestamp(second.endDate))
      .slice(0, 3),
  );
  readonly filteredSurveys = computed(() => {
    const category = this.selectedCategory();
    const filter = this.surveyFilter();
    return this.surveys
      .surveys()
      .filter(
        (survey) =>
          (filter === 'active' ? this.isActiveSurvey(survey) : this.isPastSurvey(survey)) &&
          (!category || survey.category === category),
      )
      .sort((first, second) => this.endDateTimestamp(first.endDate) - this.endDateTimestamp(second.endDate));
  });
  /** Converts an optional end date into a sortable timestamp.
   * @param endDate Optional survey end date.
   * @returns Sortable timestamp or positive infinity.
   */

  private endDateTimestamp(endDate?: string) {
    return endDate ? new Date(`${endDate}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;
  }

  /** Returns whether a survey is currently active.
   * @param survey Survey status and optional end date.
   * @returns True when the survey is active.
   */
  private isActiveSurvey(survey: { status: string; endDate?: string }) {
    if (survey.status !== 'published') return false;
    if (!survey.endDate) return true;
    const end = new Date(`${survey.endDate}T23:59:59`);
    return end.getTime() >= Date.now();
  }

  /** Returns whether a published survey has already ended.
   * @param survey Survey status and optional end date.
   * @returns True when the survey has ended.
   */
  private isPastSurvey(survey: { status: string; endDate?: string }) {
    if (survey.status !== 'published' || !survey.endDate) return false;
    const end = new Date(`${survey.endDate}T23:59:59`);
    return end.getTime() < Date.now();
  }

  /** Toggles the category dropdown.
   * @returns Nothing.
   */
  toggleCategoryMenu() {
    this.isCategoryMenuOpen.update((isOpen) => !isOpen);
  }

  /** Selects a category filter and closes the dropdown.
   * @param category Category to select, or null for all categories.
   * @returns Nothing.
   */
  selectCategory(category: string | null) {
    this.selectedCategory.set(category);
    this.isCategoryMenuOpen.set(false);
  }

  /** Selects whether active or past surveys are shown.
   * @param filter Survey status filter.
   * @returns Nothing.
   */
  selectSurveyFilter(filter: 'active' | 'past') {
    this.surveyFilter.set(filter);
  }

  /** Opens the survey editor modal.
   * @returns Nothing.
   */
  openEditor() {
    this.editorModal.open();
  }

  /** Creates the human-readable end-date label for a survey.
   * @param endDate Optional survey end date.
   * @returns Human-readable date label.
   */
  endDateLabel(endDate?: string) {
    if (!endDate) return 'No end date';
    const end = new Date(`${endDate}T23:59:59`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
    if (days < 0) return 'Ended';
    if (days === 0) return 'Ends today';
    return `Ends in ${days} day${days === 1 ? '' : 's'}`;
  }

  @HostListener('document:click', ['$event'])
  /** Closes the category dropdown when clicking outside it.
   * @param event Document click event.
   * @returns Nothing.
   */
  closeCategoryMenuOnOutsideClick(event: Event) {
    if (!this.elementRef.nativeElement.querySelector('.dropdown')?.contains(event.target as Node)) {
      this.isCategoryMenuOpen.set(false);
    }
  }

}
