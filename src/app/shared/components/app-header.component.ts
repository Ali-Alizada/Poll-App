import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyEditorModalService } from '../services/survey-editor-modal.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `<header>
    @if (showCreateLinkLogo()) {
      <a routerLink="/" class="brand"> <img src="assets/imgs/poll-app-logo.svg" alt="poll-app-logo" /></a>
    }
    @if (showCreateLink()) {
      <button type="button" class="create-link" (click)="openEditor()">
        <span>Create survey</span>
        <span class="publish-checkmark" aria-hidden="true">
          <img src="assets/imgs/plus-icon-plum.svg" alt="add-icon" />
        </span>
      </button>
      @if (mobileCloseLink()) {
        <a routerLink="/" class="mobile-close-link" aria-label="Close survey">
          <img src="assets/imgs/close.svg" alt="" aria-hidden="true" />
        </a>
      }
    }
  </header>`,
  styleUrls: ['./app-header.component.scss', './responsive/app-header-responsive.scss'],
})

export class AppHeaderComponent {
  private readonly editorModal = inject(SurveyEditorModalService);
  readonly showCreateLink = input(true);
  readonly showCreateLinkLogo = input(true);
  readonly mobileCloseLink = input(false);

  openEditor() {
    this.editorModal.open();
  }
}
