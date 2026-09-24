import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { vi } from 'vitest';
import { SurveyDetailComponent } from './survey-detail.component';
import { SurveyService } from '../../core/services/survey.service';

describe('SurveyDetailComponent', () => {
  let fixture: ComponentFixture<SurveyDetailComponent>;
  let component: SurveyDetailComponent;
  let surveyService: {
    bySlug: ReturnType<typeof vi.fn>;
    submitAnswers: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  const survey = {
    id: 'survey-1',
    slug: 'demo-survey',
    title: 'Demo survey',
    description: 'A basic survey',
    category: 'Technology & Innovation',
    endDate: undefined,
    status: 'published' as const,
    createdAt: '2024-01-01T00:00:00.000Z',
    questions: [
      {
        id: 'question-1',
        text: 'Favorite framework?',
        allowMultiple: false,
        options: [
          { id: 'option-1', label: 'Angular' },
          { id: 'option-2', label: 'React' },
        ],
      },
    ],
    answers: {},
  };

  beforeEach(async () => {
    surveyService = {
      bySlug: vi.fn(() => survey),
      submitAnswers: vi.fn().mockResolvedValue(undefined),
    };
    router = { navigate: vi.fn().mockResolvedValue(true) };

    await TestBed.configureTestingModule({
      imports: [SurveyDetailComponent],
      providers: [
        { provide: SurveyService, useValue: surveyService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'demo-survey' } } } },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('keeps local answers pending until the survey is completed', async () => {
    await component.vote('survey-1', 'question-1', 'option-1');
    fixture.detectChanges();

    expect(component.isSelected('question-1', 'option-1')).toBe(true);
    expect(component.resultAnswers()['question-1']).toEqual(['option-1']);
    expect(component.percent(component.resultAnswers()['question-1'], 'option-1')).toBe(100);
    expect(fixture.nativeElement.querySelector('.result-bar-fill').style.getPropertyValue('--result-bar-width')).toBe('100%');
    expect(surveyService.submitAnswers).not.toHaveBeenCalled();

    await component.completeSurvey();

    expect(surveyService.submitAnswers).toHaveBeenCalledWith('survey-1', {
      'question-1': ['option-1'],
    });
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('keeps multiple local answers selected until completion', async () => {
    survey.questions[0].allowMultiple = true;

    await component.vote('survey-1', 'question-1', 'option-1');
    await component.vote('survey-1', 'question-1', 'option-2');

    expect(component.isSelected('question-1', 'option-1')).toBe(true);
    expect(component.isSelected('question-1', 'option-2')).toBe(true);
    expect(component.canComplete()).toBe(true);
    expect(surveyService.submitAnswers).not.toHaveBeenCalled();

    await component.completeSurvey();

    expect(surveyService.submitAnswers).toHaveBeenCalledWith('survey-1', {
      'question-1': ['option-1', 'option-2'],
    });
  });
});
