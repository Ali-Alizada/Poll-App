# PollApp

## Projektbeschreibung

PollApp ist eine interaktive Webanwendung zum Erstellen, Verwalten und Beantworten von Umfragen. Nutzerinnen und Nutzer können neue Umfragen mit mehreren Antwortmöglichkeiten anlegen, bestehende Umfragen ansehen und an Abstimmungen teilnehmen. Die Ergebnisse werden über Supabase gespeichert und dank Realtime-Unterstützung direkt aktualisiert.

Das Projekt dient als moderne Poll-App mit klarer Angular-Struktur. Die Anwendung trennt wiederverwendbare Komponenten, fachliche Services und einzelne Funktionsbereiche wie Startseite, Umfrage-Detailansicht und Umfrage-Editor.

## Verwendete Technologien

### Programmiersprachen

| Technologie | Beschreibung |
| --- | --- |
| [![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) | Typsichere Programmiersprache für die Anwendungslogik |
| [![HTML5](https://img.shields.io/badge/HTML5-Standard-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/de/docs/Web/HTML) | Struktur und Inhalte der Benutzeroberfläche |
| [![SCSS](https://img.shields.io/badge/SCSS-Styles-CF649A?logo=sass&logoColor=white)](https://sass-lang.com/) | Modular aufgebaute und responsive Gestaltung |

### Frameworks und Bibliotheken

| Technologie | Beschreibung |
| --- | --- |
| [![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)](https://angular.dev/) | Framework für die komponentenbasierte Webanwendung |
| [![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/) | Datenbank, API und Echtzeit-Updates für Umfragen |
| [![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?logo=reactivex&logoColor=white)](https://rxjs.dev/) | Reaktive Datenströme und asynchrone Verarbeitung |
| [![Vitest](https://img.shields.io/badge/Vitest-Tests-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/) | Test-Runner für Unit-Tests |

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
