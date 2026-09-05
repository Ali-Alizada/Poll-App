import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Question } from '../../core/models/survey.model';
import { SurveyService } from '../../core/services/survey.service';
import { AppHeaderComponent } from '../../shared/components/app-header.component';

@Component({
  imports: [ReactiveFormsModule, AppHeaderComponent],
  templateUrl: `./survey-editor.component.html`,
  styleUrl: './survey-editor.component.scss',
})

export class SurveyEditorComponent {
  private readonly fb = inject(FormBuilder);
  private readonly surveyService = inject(SurveyService);
  private readonly router = inject(Router);
  readonly form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    questions: this.fb.array([this.newQuestion()]),
  });
  get questions() {
    return this.form.controls.questions;
  }
  options(index: number) {
    return this.questions.at(index).controls.options;
  }
  private newQuestion() {
    return this.fb.group({
      text: ['', Validators.required],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
      ]),
    });
  }
  addQuestion() {
    this.questions.push(this.newQuestion());
  }
  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }
  addOption(index: number) {
    this.options(index).push(this.fb.control('', Validators.required));
  }
  removeOption(question: number, option: number) {
    this.options(question).removeAt(option);
  }
  async publish() {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const questions: Question[] = value.questions.map((question) => ({
      id: crypto.randomUUID(),
      text: question.text!,
      options: question.options.map((label) => ({ id: crypto.randomUUID(), label: label! })),
    }));
    try {
      const survey = await this.surveyService.create(value.title!, value.description!, questions);
      await this.router.navigate(['/surveys', survey.slug]);
    } catch (error: unknown) {
      console.error('Survey konnte nicht gespeichert werden:', error);
      const message = typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : JSON.stringify(error);
      alert(`Die Umfrage konnte nicht gespeichert werden: ${message}`);
    }
  }
}
