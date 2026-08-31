import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `<header>
    <a routerLink="/" class="brand"><span>▰</span> poll app</a
    ><a routerLink="/surveys/new" class="create-link">Create survey</a>
  </header>`,
})

export class AppHeaderComponent {}
