import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Question, SURVEY_CATEGORIES } from '../../core/models/survey.model';
import { SurveyService } from '../../core/services/survey.service';

@Component({
  imports: [ReactiveFormsModule],
  templateUrl: `./survey-editor.component.html`,
  styleUrl: './survey-editor.component.scss',
})

export class SurveyEditorComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly fb = inject(FormBuilder);
  private readonly surveyService = inject(SurveyService);
  private readonly router = inject(Router);
  readonly categories = SURVEY_CATEGORIES;
  readonly isCategoryMenuOpen = signal(false);
  readonly form = this.fb.group({
    title: ['', Validators.required],
    endDate: [''],
    description: [''],
    category: this.fb.control<(typeof SURVEY_CATEGORIES)[number]>(SURVEY_CATEGORIES[0], Validators.required),
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
      allowMultiple: [false],
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
  clearField(controlName: 'title' | 'endDate' | 'description') {
    this.form.controls[controlName].setValue('');
  }
  clearQuestion(index: number) {
    this.questions.at(index).controls.text.setValue('');
  }
  clearOption(question: number, option: number) {
    this.options(question).at(option).setValue('');
  }
  answerLetter(index: number) {
    let letter = '';
    let currentIndex = index;
    do {
      letter = String.fromCharCode(65 + (currentIndex % 26)) + letter;
      currentIndex = Math.floor(currentIndex / 26) - 1;
    } while (currentIndex >= 0);
    return letter;
  }
  addOption(index: number) {
    this.options(index).push(this.fb.control('', Validators.required));
  }
  removeOption(question: number, option: number) {
    this.options(question).removeAt(option);
  }
  closeEditor() {
    void this.router.navigate(['/']);
  }

  toggleCategoryMenu() {
    this.isCategoryMenuOpen.update((isOpen) => !isOpen);
  }

  @HostListener('document:click', ['$event'])
  closeCategoryMenuOnOutsideClick(event: Event) {
    if (!this.elementRef.nativeElement.querySelector('.category-dropdown')?.contains(event.target as Node)) {
      this.isCategoryMenuOpen.set(false);
    }
  }

  selectCategory(category: (typeof SURVEY_CATEGORIES)[number]) {
    this.form.controls.category.setValue(category);
    this.isCategoryMenuOpen.set(false);
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
      const survey = await this.surveyService.create(
        value.title!,
        value.endDate || undefined,
        value.description!,
        value.category!,
        questions,
      );
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
