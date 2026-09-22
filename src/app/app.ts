import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SurveyEditorComponent } from './features/survey-editor/survey-editor.component';
import { SurveyEditorModalService } from './shared/services/survey-editor-modal.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SurveyEditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly editorModal = inject(SurveyEditorModalService);

  @HostListener('document:keydown.escape')
  closeEditorOnEscape() {
    this.editorModal.close();
  }
}
