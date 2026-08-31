import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';
import { AppHeaderComponent } from '../../shared/components/app-header.component';
@Component({
  imports: [RouterLink, AppHeaderComponent],
  template: `<main class="page-shell"><app-header /><section class="hero"><div><p class="eyebrow">✦ Feedback made simple</p><h1>Collect feedback,<br>unlock ideas</h1><p>Create and share surveys in minutes – from team events to workplace culture.</p><a routerLink="/surveys/new" class="button">New survey</a></div><div class="hero-art">☷<span>?</span></div></section><section class="content"><div class="section-heading"><div><p class="eyebrow">Your surveys</p><h2>What do you want to know?</h2></div><a routerLink="/surveys/new" class="text-link">+ Create a new survey</a></div><div class="survey-grid">@for (survey of surveys.published(); track survey.id) {<a [routerLink]="['/surveys', survey.slug]" class="survey-card"><span class="badge">Published</span><h3>{{ survey.title }}</h3><p>{{ survey.description }}</p><span class="open">Open survey →</span></a>}</div></section></main>`,
})
export class HomeComponent { readonly surveys = inject(SurveyService); }
