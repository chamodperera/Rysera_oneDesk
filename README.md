# OneDesk

A comprehensive desk management application built with TypeScript, using Turborepo for monorepo management and pnpm for package management.

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

### Development

Start the development servers:

```bash
pnpm dev
```

This will start:
- Frontend (React/Vite) on `http://localhost:3000`
- Backend (Express API) on `http://localhost:3001`

### Building

Build all applications:

```bash
pnpm build
```

## Project Structure

This monorepo includes the following:

### Apps

- `frontend`: React application built with Vite
- `backend`: Express.js API server

### Packages

- `@repo/eslint-config`: Shared ESLint configurations
- `@repo/jest-presets`: Jest test configurations
- `@repo/logger`: Isomorphic logging utility
- `@repo/ui`: Shared React UI components
- `@repo/typescript-config`: Shared TypeScript configurations

## Technologies

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Turborepo](https://turbo.build/) for monorepo build system
- [pnpm](https://pnpm.io/) for package management
- [ESLint](https://eslint.org/) for code linting
- [Jest](https://jestjs.io) for testing
- [Prettier](https://prettier.io) for code formatting
