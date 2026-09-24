import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyDetailComponent } from './survey-detail.component';
import { SurveyService } from '../../core/services/survey.service';

describe('SurveyDetailComponent', () => {
  let fixture: ComponentFixture<SurveyDetailComponent>;
  let component: SurveyDetailComponent;
  let surveyService: jasmine.SpyObj<SurveyService>;
  let router: jasmine.SpyObj<Router>;

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
    surveyService = jasmine.createSpyObj<SurveyService>('SurveyService', ['bySlug', 'submitAnswers']);
    surveyService.bySlug.and.returnValue(survey);
    surveyService.submitAnswers.and.resolveTo();
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);

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

    expect(component.isSelected('question-1', 'option-1')).toBeTrue();
    expect(surveyService.submitAnswers).not.toHaveBeenCalled();

    await component.completeSurvey();

    expect(surveyService.submitAnswers).toHaveBeenCalledWith('survey-1', {
      'question-1': ['option-1'],
    });
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
