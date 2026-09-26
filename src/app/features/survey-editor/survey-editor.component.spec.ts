import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';
import { SurveyEditorComponent } from './survey-editor.component';

describe('SurveyEditorComponent', () => {
  let fixture: ComponentFixture<SurveyEditorComponent>;
  let component: SurveyEditorComponent;
  let createSurveyCallCount: number;

  beforeEach(async () => {
    createSurveyCallCount = 0;
    await TestBed.configureTestingModule({
      imports: [SurveyEditorComponent],
      providers: [
        provideRouter([]),
        {
          provide: SurveyService,
          useValue: {
            create: async () => {
              createSurveyCallCount += 1;
              return { slug: 'published-survey' };
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should delete the whole question from the second question onward', () => {
    component.addQuestion();
    component.addQuestion();

    component.questions.at(1).controls.text.setValue('Second question');
    component.questions.at(2).controls.text.setValue('Third question');

    component.deleteQuestion(1);

    expect(component.questions.length).toBe(2);
    expect(component.questions.at(0).controls.text.value).toBe('');
    expect(component.questions.at(1).controls.text.value).toBe('Third question');
  });

  it('should clear then remove the selected answer from the second question', () => {
    component.addQuestion();
    const answerOptions = component.options(1);
    answerOptions.at(0).setValue('First answer');
    answerOptions.at(1).setValue('Second answer');
    const selectedAnswer = answerOptions.at(0);

    component.deleteOption(1, 0);
    expect(answerOptions.at(0).value).toBe('');
    expect(answerOptions.length).toBe(2);

    component.deleteOption(1, 0);
    expect(answerOptions.length).toBe(1);
    expect(answerOptions.at(0).value).toBe('Second answer');
    expect(answerOptions.controls).not.toContain(selectedAnswer);
  });

  it('should reset the editor and block another publish after success', async () => {
    component.form.controls.title.setValue('A valid survey title');
    component.questions.at(0).controls.text.setValue('A valid question text');
    component.options(0).at(0).setValue('First answer');
    component.options(0).at(1).setValue('Second answer');

    await component.publish();
    await component.publish();

    expect(createSurveyCallCount).toBe(1);
    expect(component.form.controls.title.value).toBe('');
    expect(component.questions.length).toBe(1);
    expect(component.options(0).length).toBe(2);
    expect(component.isPublished()).toBe(true);

    fixture.detectChanges();
    const publishButton = fixture.nativeElement.querySelector('.form-actions button') as HTMLButtonElement;
    expect(publishButton.disabled).toBe(true);
  });

  it('should reject whitespace-only required fields', () => {
    component.form.controls.title.setValue('          ');
    component.questions.at(0).controls.text.setValue('          ');
    component.options(0).at(0).setValue(' ');

    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.title.hasError('blank')).toBe(true);
    expect(component.questions.at(0).controls.text.hasError('blank')).toBe(true);
    expect(component.options(0).at(0).hasError('blank')).toBe(true);
  });

  it('should validate optional description and end date values', () => {
    component.form.controls.description.setValue('   ');
    component.form.controls.endDate.setValue('2026-02-30');

    expect(component.form.controls.description.hasError('blank')).toBe(true);
    expect(component.form.controls.endDate.hasError('date')).toBe(true);

    component.form.controls.description.setValue('A valid description');
    component.form.controls.endDate.setValue('2026-02-28');

    expect(component.form.controls.description.valid).toBe(true);
    expect(component.form.controls.endDate.valid).toBe(true);
  });
});
