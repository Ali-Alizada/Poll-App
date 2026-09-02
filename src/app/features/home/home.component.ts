import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../../core/services/survey.service';
import { AppHeaderComponent } from '../../shared/components/app-header.component';



@Component({
  imports: [RouterLink, AppHeaderComponent],
  templateUrl: './home.component.html',
  // styleUrl:
})

export class HomeComponent {
  readonly surveys = inject(SurveyService);
}
