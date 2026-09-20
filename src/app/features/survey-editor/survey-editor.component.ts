import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Question, SURVEY_CATEGORIES } from '../../core/models/survey.model';
import { SurveyService } from '../../core/services/survey.service';
import { AppHeaderComponent } from '../../shared/components/app-header.component';

@Component({
  imports: [ReactiveFormsModule, AppHeaderComponent],
  templateUrl: `./survey-editor.component.html`,
  styleUrls: ['./survey-editor.component.scss', './responsive/survey-editor-responsive.scss'],
})

export class SurveyEditorComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly fb = inject(FormBuilder);
  private readonly surveyService = inject(SurveyService);
  private readonly router = inject(Router);
  readonly categories = SURVEY_CATEGORIES;
  readonly isCategoryMenuOpen = signal(false);
  readonly isPublished = signal(false);
  private publishedSurveySlug: string | null = null;

  readonly form = this.fb.group({
    title: ['', Validators.required],
    endDate: [''],
    description: [''],
    category: this.fb.control<(typeof SURVEY_CATEGORIES)[number]>(
      SURVEY_CATEGORIES[0],
      Validators.required,
    ),
    questions: this.fb.array([this.newQuestion()]),
  });

  /** Returns the question form array.
   * @returns The question controls.
   */
  get questions() {
    return this.form.controls.questions;
  }

  /** Returns the options of one question.
   * @param index Question index.
   * @returns The question's option controls.
   */
  options(index: number) {
    return this.questions.at(index).controls.options;
  }

  /** Creates a question form group with two required options.
   * @returns A new question form group.
   */
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

  /** Adds an empty question to the form.
   * @returns Nothing.
   */
  addQuestion() {
    this.questions.push(this.newQuestion());
  }

  /** Removes a question at the given index.
   * @param index Question index.
   * @returns Nothing.
   */
  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  /** Clears the first question or removes later questions.
   * @param index Question index.
   * @returns Nothing.
   */
  deleteQuestion(index: number) {
    if (index === 0) {
      this.clearQuestion(index);
      return;
    }
    this.removeQuestion(index);
  }

  /** Clears one of the survey text fields.
   * @param controlName Name of the field to clear.
   * @returns Nothing.
   */
  clearField(controlName: 'title' | 'endDate' | 'description') {
    this.form.controls[controlName].setValue('');
  }

  /** Clears the text of one question.
   * @param index Question index.
   * @returns Nothing.
   */
  clearQuestion(index: number) {
    this.questions.at(index).controls.text.setValue('');
  }

  /** Clears one option label.
   * @param question Question index.
   * @param option Option index.
   * @returns Nothing.
   */
  clearOption(question: number, option: number) {
    this.options(question).at(option).setValue('');
  }

  /** Converts an option index to its alphabetic label.
   * @param index Option index.
   * @returns Alphabetic option label.
   */
  answerLetter(index: number) {
    let letter = '';
    let currentIndex = index;
    do {
      letter = String.fromCharCode(65 + (currentIndex % 26)) + letter;
      currentIndex = Math.floor(currentIndex / 26) - 1;
    } while (currentIndex >= 0);
    return letter;
  }

  /** Adds an empty option to a question.
   * @param index Question index.
   * @returns Nothing.
   */
  addOption(index: number) {
    this.options(index).push(this.fb.control('', Validators.required));
  }

  /** Removes an option from a question.
   * @param question Question index.
   * @param option Option index.
   * @returns Nothing.
   */
  removeOption(question: number, option: number) {
    this.options(question).removeAt(option);
  }

  /** Navigates back to the home page.
   * @returns Nothing.
   */
  closeEditor() {
    void this.router.navigate(['/']);
  }

  /** Closes the success notice and opens the new survey.
   * @returns Nothing.
   */
  closePublishNotification() {
    this.isPublished.set(false);
    if (this.publishedSurveySlug) {
      void this.router.navigate(['/surveys', this.publishedSurveySlug]);
    }
  }

  /** Toggles the category dropdown.
   * @returns Nothing.
   */
  toggleCategoryMenu() {
    this.isCategoryMenuOpen.update((isOpen) => !isOpen);
  }

  @HostListener('document:click', ['$event'])
  /** Closes the category dropdown when clicking outside it.
   * @param event Document click event.
   * @returns Nothing.
   */
  closeCategoryMenuOnOutsideClick(event: Event) {
    if (
      !this.elementRef.nativeElement
        .querySelector('.category-dropdown')
        ?.contains(event.target as Node)
    ) {
      this.isCategoryMenuOpen.set(false);
    }
  }

  /** Selects a category and closes its dropdown.
   * @param category Category to select.
   * @returns Nothing.
   */
  selectCategory(category: (typeof SURVEY_CATEGORIES)[number]) {
    this.form.controls.category.setValue(category);
    this.isCategoryMenuOpen.set(false);
  }

  /** Validates and publishes the survey form.
   * @returns A promise resolved after publishing or showing an error.
   */
  async publish() {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const questions = this.createQuestions(value.questions);
    try {
      const survey = await this.surveyService.create(
        value.title!, value.endDate || undefined, value.description!, value.category!, questions,
      );
      this.publishedSurveySlug = survey.slug;
      this.isPublished.set(true);
    } catch (error: unknown) {
      this.showPublishError(error);
    }
  }

  /** Creates domain questions from the form value.
   * @param formQuestions Question values from the form.
   * @returns Domain questions with generated identifiers.
   */
  private createQuestions(formQuestions: Array<{ text: string | null; options: (string | null)[] }>) {
    return formQuestions.map((question): Question => ({
      id: crypto.randomUUID(),
      text: question.text!,
      options: question.options.map((label) => ({ id: crypto.randomUUID(), label: label! })),
    }));
  }

  /** Shows a readable message when publishing fails.
   * @param error Unknown publishing error.
   * @returns Nothing.
   */
  private showPublishError(error: unknown) {
    const message = typeof error === 'object' && error !== null && 'message' in error
      ? String(error.message)
      : JSON.stringify(error);
    alert(`Die Umfrage konnte nicht gespeichert werden: ${message}`);
  }
}
