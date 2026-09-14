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
});
