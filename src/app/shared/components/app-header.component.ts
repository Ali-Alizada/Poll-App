import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `<header>
    @if (showCreateLinkLogo()) {
      <a routerLink="/" class="brand"> <img src="assets/imgs/poll-app-logo.svg" alt="poll-app-logo" /></a>
    }
    @if (showCreateLink()) {
      <a routerLink="/surveys/new" class="create-link">
        <span>Create survey</span>
        <span class="publish-checkmark" aria-hidden="true">
          <img src="assets/imgs/plus-icon-plum.svg" alt="add-icon" />
        </span>
      </a>
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
  readonly showCreateLink = input(true);
  readonly showCreateLinkLogo = input(true);
  readonly mobileCloseLink = input(false);
}
