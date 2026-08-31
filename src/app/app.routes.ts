import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { SurveyDetailComponent } from './features/survey-detail/survey-detail.component';
import { SurveyEditorComponent } from './features/survey-editor/survey-editor.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Poll App' },
  { path: 'surveys/new', component: SurveyEditorComponent, title: 'Create survey' },
  { path: 'surveys/:slug', component: SurveyDetailComponent, title: 'Survey' },
  { path: '**', redirectTo: '' },
];
