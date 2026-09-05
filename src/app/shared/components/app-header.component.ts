import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `<header>
    <a routerLink="/" class="brand"><img src="./assets/imgs/poll-app-logo-yellow.svg" alt="" /></a>

    @if (showCreateLink()) {
    <a routerLink="/surveys/new" class="create-link">Create survey</a>
    }

  </header>`,
  styleUrl: './app-header.component.scss',
})

export class AppHeaderComponent {
  readonly showCreateLink = input(true);


}
