import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SurveyEditorModalService {
  readonly isOpen = signal(false);

  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      this.document.body.classList.toggle('modal-open', this.isOpen());
    });
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }
}
