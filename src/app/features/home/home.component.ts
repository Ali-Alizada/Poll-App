import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SURVEY_CATEGORIES } from '../../core/models/survey.model';
import { SurveyService } from '../../core/services/survey.service';
import { AppHeaderComponent } from '../../shared/components/app-header.component';



@Component({
  imports: [RouterLink, AppHeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})

export class HomeComponent {
  readonly surveys = inject(SurveyService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  readonly categories = SURVEY_CATEGORIES;
  readonly selectedCategory = signal<string | null>(null);
  readonly isCategoryMenuOpen = signal(false);
  readonly surveyFilter = signal<'active' | 'past'>('active');
  readonly newestSurvey = computed(() => this.surveys.published()[0]);
  readonly filteredSurveys = computed(() => {
    const category = this.selectedCategory();
    const filter = this.surveyFilter();
    return this.surveys.surveys().filter(
      (survey) =>
        (filter === 'active' ? survey.status === 'published' : survey.status === 'draft') &&
        (!category || survey.category === category),
    );
  });

  toggleCategoryMenu() {
    this.isCategoryMenuOpen.update((isOpen) => !isOpen);
  }

  selectCategory(category: string | null) {
    this.selectedCategory.set(category);
    this.isCategoryMenuOpen.set(false);
  }

  selectSurveyFilter(filter: 'active' | 'past') {
    this.surveyFilter.set(filter);
  }

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
  closeCategoryMenuOnOutsideClick(event: Event) {
    if (!this.elementRef.nativeElement.querySelector('.dropdown')?.contains(event.target as Node)) {
      this.isCategoryMenuOpen.set(false);
    }
  }
}
