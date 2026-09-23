# PollApp

## Project Description

PollApp is an interactive web application for creating, managing, and answering polls. Users can create new polls with multiple answer options, view existing polls, and participate in votes. The results are stored with Supabase and updated instantly through realtime functionality.

The project is a modern polling application with a clear Angular structure. The application separates reusable components, domain services, and individual feature areas such as the home page, poll details, and the poll editor.

## Technologies Used

### Programming Languages

| Technology | Description |
| --- | --- |
| [![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) | Type-safe programming language for the application logic |
| [![HTML5](https://img.shields.io/badge/HTML5-Standard-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML) | Structure and content of the user interface |
| [![SCSS](https://img.shields.io/badge/SCSS-Styles-CF649A?logo=sass&logoColor=white)](https://sass-lang.com/) | Modular and responsive styling |

### Frameworks and Libraries

| Technology | Description |
| --- | --- |
| [![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)](https://angular.dev/) | Framework for the component-based web application |
| [![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/) | Database, API, and realtime updates for polls |
| [![Vitest](https://img.shields.io/badge/Vitest-Tests-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/) | Test runner for unit tests |

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
