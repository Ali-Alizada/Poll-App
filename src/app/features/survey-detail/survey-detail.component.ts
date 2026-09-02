import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';
import { AppHeaderComponent } from '../../shared/components/app-header.component';
@Component({
  imports: [RouterLink, AppHeaderComponent],
  templateUrl: './survey-detail.component.html',
})

export class SurveyDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly surveys = inject(SurveyService);
  readonly survey = computed(() =>
    this.surveys.bySlug(this.route.snapshot.paramMap.get('slug') ?? ''),
  );
  vote(surveyId: string, questionId: string, optionId: string) {
    this.surveys.addAnswer(surveyId, questionId, optionId);
  }
  count(values: string[] | undefined, optionId: string) {
    return values?.filter((value) => value === optionId).length ?? 0;
  }
  percent(values: string[] | undefined, optionId: string) {
    const total = values?.length ?? 0;
    return total ? Math.round((this.count(values, optionId) / total) * 100) : 0;
  }
}
