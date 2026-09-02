import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Question } from '../../core/models/survey.model';
import { SurveyService } from '../../core/services/survey.service';
import { AppHeaderComponent } from '../../shared/components/app-header.component';

@Component({
  imports: [ReactiveFormsModule, AppHeaderComponent],
  template: `<main class="page-shell">
    <app-header />
    <section class="editor">
      <div class="editor-heading">
        <p class="eyebrow">New survey</p>
        <h1>Create new survey</h1>
      </div>
      <form [formGroup]="form" (ngSubmit)="publish()">
        <div class="field-grid">
          <label
            >Survey name<input
              formControlName="title"
              placeholder="e.g. Summer team event" /></label
          ><label
            >Description<textarea
              formControlName="description"
              placeholder="What should participants know?"
            ></textarea>
          </label>
        </div>
        <div formArrayName="questions">
          @for (question of questions.controls; track $index; let i = $index) {
            <section class="editor-question" [formGroupName]="i">
              <div class="question-top">
                <strong>Question {{ i + 1 }}</strong>
                @if (questions.length > 1) {
                  <button type="button" class="remove" (click)="removeQuestion(i)">Remove</button>
                }
              </div>
              <label
                >Question<input formControlName="text" placeholder="What would you like to know?"
              /></label>
              <div formArrayName="options" class="option-inputs">
                @for (option of options(i).controls; track $index; let j = $index) {
                  <div>
                    <input [formControlName]="j" [placeholder]="'Answer ' + (j + 1)" />
                    @if (options(i).length > 2) {
                      <button type="button" (click)="removeOption(i, j)">×</button>
                    }
                  </div>
                }
                <button type="button" class="add-option" (click)="addOption(i)">
                  + Add answer
                </button>
              </div>
            </section>
          }
        </div>
        <button type="button" class="add-question" (click)="addQuestion()">
          + Add new question
        </button>
        <div class="form-actions">
          <button class="button" type="submit" [disabled]="form.invalid">Publish survey</button>
        </div>
      </form>
    </section>
  </main>`,
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
