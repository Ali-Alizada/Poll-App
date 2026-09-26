import { Component, ElementRef, EventEmitter, HostListener, inject, Input, Output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Question, SURVEY_CATEGORIES } from '../../core/models/survey.model';
import { SurveyService } from '../../core/services/survey.service';
import { AppHeaderComponent } from '../../shared/components/app-header.component';

/** Validates that a required text value contains non-whitespace characters.
 * @param control Form control to validate.
 * @returns A validation error or null when the value is valid.
 */
const nonBlankValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { blank: true };

/** Validates optional text when a value has been entered.
 * @param control Form control to validate.
 * @returns A validation error or null when the value is valid.
 */
const optionalTextValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value === null || control.value === '') return null;
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { blank: true };
};

/** Validates an optional calendar date in YYYY-MM-DD format.
 * @param control Form control to validate.
 * @returns A validation error or null when the value is valid.
 */
const optionalDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { date: true };
  }
  return isCalendarDate(value) && value >= getTodayDate() ? null : { date: true };
};

/** Returns today's date in the format expected by a date input.
 * @returns Today's local date in YYYY-MM-DD format.
 */
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Checks whether a date string contains a real calendar date.
 * @param value Date string in YYYY-MM-DD format.
 * @returns True when the date exists in the calendar.
 */
function isCalendarDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

@Component({
  selector: 'app-survey-editor',
  host: { '[class.modal-editor]': 'modal' },
  imports: [ReactiveFormsModule, AppHeaderComponent],
  templateUrl: `./survey-editor.component.html`,
  styleUrls: ['./survey-editor.component.scss', './responsive/survey-editor-responsive.scss'],
})

export class SurveyEditorComponent {
  private readonly pendingOptionDeletes = new Set<AbstractControl>();

  @Input() modal = false;
  @Output() readonly closed = new EventEmitter<void>();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly fb = inject(FormBuilder);
  private readonly surveyService = inject(SurveyService);
  private readonly router = inject(Router);
  readonly categories = SURVEY_CATEGORIES;
  readonly minEndDate = getTodayDate();
  readonly isCategoryMenuOpen = signal(false);
  readonly isPublished = signal(false);
  readonly isPublishing = signal(false);
  private publishedSurveySlug: string | null = null;

  readonly form = this.fb.group({
    title: ['', [Validators.required, nonBlankValidator, Validators.minLength(10)]],
    endDate: ['', optionalDateValidator],
    description: ['', optionalTextValidator],
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
      text: ['', [Validators.required, nonBlankValidator, Validators.minLength(10)]],
      allowMultiple: [false],
      options: this.fb.array([
        this.fb.control('', [Validators.required, nonBlankValidator, Validators.minLength(2)]),
        this.fb.control('', [Validators.required, nonBlankValidator, Validators.minLength(2)]),
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

  /** Clears the default question or removes later questions.
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

  /** Trims surrounding whitespace when a text field loses focus.
   * @param control Form control to normalize.
   * @returns Nothing.
   */
  trimOnBlur(control: AbstractControl) {
    if (typeof control.value === 'string') {
      control.setValue(control.value.trim());
    }
    control.markAsTouched();
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
    const control = this.options(question).at(option);
    control.setValue('');
    this.pendingOptionDeletes.delete(control);
  }

  /** Clears an option on the first click and removes it on the next click.
   * @param question Question index.
   * @param option Option index.
   * @returns Nothing.
   */
  deleteOption(question: number, option: number) {
    const optionControl = this.options(question).at(option);
    if (this.pendingOptionDeletes.has(optionControl)) {
      this.options(question).removeAt(option);
      this.pendingOptionDeletes.delete(optionControl);
      return;
    }

    optionControl.setValue('');
    this.pendingOptionDeletes.add(optionControl);
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
    this.options(index).push(
      this.fb.control('', [Validators.required, nonBlankValidator, Validators.minLength(2)]),
    );
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
    this.closed.emit();
  }

  /** Closes the success notice and opens the new survey.
   * @returns Nothing.
   */
  closePublishNotification() {
    this.isPublished.set(false);
    this.closed.emit();
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
    if (this.isPublishing() || this.isPublished()) return;

    this.trimFormValues();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isPublishing.set(true);
    try {
      await this.createSurveyFromForm();
      this.resetForm();
    } catch (error: unknown) {
      this.showPublishError(error);
    } finally {
      this.isPublishing.set(false);
    }
  }

  /** Restores the editor to one empty question after a successful publish.
   * @returns Nothing.
   */
  private resetForm() {
    this.questions.clear();
    this.questions.push(this.newQuestion());
    this.pendingOptionDeletes.clear();
    this.form.reset({
      title: '',
      endDate: '',
      description: '',
      category: SURVEY_CATEGORIES[0],
      questions: [{ text: '', allowMultiple: false, options: ['', ''] }],
    });
    this.isCategoryMenuOpen.set(false);
  }

  /** Creates and stores a survey from the current form values.
   * @returns A promise resolved after the success notice is shown.
   */
  private async createSurveyFromForm() {
    const value = this.form.getRawValue();
    const questions = this.createQuestions(value.questions);
    const survey = await this.surveyService.create(
      value.title!, value.endDate || undefined, value.description!, value.category!, questions,
    );
    this.publishedSurveySlug = survey.slug;
    this.isPublished.set(true);
  }

  /** Removes leading and trailing whitespace from every text form value.
   * @returns Nothing.
   */
  private trimFormValues() {
    this.form.patchValue({
      title: this.form.controls.title.value?.trim() ?? '',
      endDate: this.form.controls.endDate.value?.trim() ?? '',
      description: this.form.controls.description.value?.trim() ?? '',
    });
    this.questions.controls.forEach((question) => {
      question.controls.text.setValue(question.controls.text.value?.trim() ?? '');
      question.controls.options.controls.forEach((option) => {
        option.setValue(option.value?.trim() ?? '');
      });
    });
  }

  /** Creates domain questions from the form value.
   * @param formQuestions Question values from the form.
   * @returns Domain questions with generated identifiers.
   */
  private createQuestions(formQuestions: Array<{
    text: string | null;
    allowMultiple: boolean | null;
    options: (string | null)[];
  }>) {
    return formQuestions.map((question): Question => ({
      id: crypto.randomUUID(),
      text: question.text!,
      allowMultiple: question.allowMultiple ?? false,
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
