import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `<header>
    @if (showCreateLinkLogo()) {
      <a routerLink="/" class="brand"> <img src="./assets/imgs/poll-app-logo.svg" alt="" /></a>
    }
    @if (showCreateLink()) {
      <a routerLink="/surveys/new" class="create-link">
        <span>Create survey</span>
        <span class="publish-checkmark" aria-hidden="true">
          <img src="../assets/imgs/plus-icon-plum.svg" alt="" />
        </span>
      </a>
    }
  </header>`,
  styleUrl: './app-header.component.scss',
})

export class AppHeaderComponent {
  readonly showCreateLink = input(true);
  readonly showCreateLinkLogo = input(true);
}
