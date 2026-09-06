import { Component, computed, inject, signal } from '@angular/core';
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
  readonly categories = SURVEY_CATEGORIES;
  readonly selectedCategory = signal<string | null>(null);
  readonly isCategoryMenuOpen = signal(true);
  readonly filteredSurveys = computed(() => {
    const category = this.selectedCategory();
    return this.surveys.published().filter((survey) => !category || survey.category === category);
  });

  toggleCategoryMenu() {
    this.isCategoryMenuOpen.update((isOpen) => !isOpen);
  }

  selectCategory(category: string | null) {
    this.selectedCategory.set(category);
  }
}
