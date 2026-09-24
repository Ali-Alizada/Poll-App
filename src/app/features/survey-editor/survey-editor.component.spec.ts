import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurveyEditorComponent } from './survey-editor.component';

describe('SurveyEditorComponent', () => {
  let fixture: ComponentFixture<SurveyEditorComponent>;
  let component: SurveyEditorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyEditorComponent],
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
