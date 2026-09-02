import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';
import { AppHeaderComponent } from '../../shared/components/app-header.component';
@Component({
  imports: [RouterLink, AppHeaderComponent],
  template: `<main class="page-shell">
    <app-header />
    @if (survey(); as current) {
      <a routerLink="/" class="back-link">← All surveys</a>
      <section class="survey-page">
        <div class="questions">
          <span class="badge">Published</span>
          <h1>{{ current.title }}</h1>
          <p class="lead">{{ current.description }}</p>
          @for (question of current.questions; track question.id; let index = $index) {
            <article class="question">
              <p class="question-number">{{ index + 1 }}. Question</p>
              <h2>{{ question.text }}</h2>
              <div class="options">
                @for (option of question.options; track option.id) {
                  <button (click)="vote(current.id, question.id, option.id)">
                    <span>{{ option.label }}</span
                    ><span>+</span>
                  </button>
                }
              </div>
            </article>
          }
        </div>
        <aside class="results">
          <p class="eyebrow">Survey results · Live</p>
          <h2>What the team thinks</h2>
          @for (question of current.questions; track question.id) {
            <div class="result-question">
              <h3>{{ question.text }}</h3>
              @for (option of question.options; track option.id) {
                <div class="result-row">
                  <div>
                    <span>{{ option.label }}</span
                    ><strong>{{ count(current.answers[question.id], option.id) }}</strong>
                  </div>
                  <div class="bar">
                    <i [style.width.%]="percent(current.answers[question.id], option.id)"></i>
                  </div>
                </div>
              }
            </div>
          }
          <p class="result-note">Results update as votes arrive.</p>
        </aside>
      </section>
    } @else {
      <p>Diese Umfrage gibt es nicht.</p>
    }
  </main>`,
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
