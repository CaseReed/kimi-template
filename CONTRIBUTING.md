# Contributing to kimi-template

Thank you for your interest in contributing to kimi-template! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended)
- Docker (for local database)

### Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```
4. Start the database:
   ```bash
   pnpm db:up
   ```
5. Run migrations:
   ```bash
   pnpm db:push
   ```
6. Start the development server:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branch Naming

- `feat/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits:

```
feat: add new authentication provider
fix: resolve login redirect issue
docs: update README with new examples
refactor: simplify dashboard data fetching
test: add unit tests for auth actions
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Run `pnpm lint` before committing
- **Formatting**: Follow existing code patterns
- **Imports**: Use `@/` aliases for project imports

### Testing

All contributions should include tests:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

#### Writing Tests

- Place tests next to the source files (e.g., `utils.ts` → `utils.test.ts`)
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

Example:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-module';

describe('myFunction', () => {
  it('should return expected result for valid input', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## Pull Request Process

1. **Create a branch** from `main` with a descriptive name
2. **Make your changes** following the code style guidelines
3. **Add tests** for new functionality
4. **Run the test suite** and ensure all tests pass
5. **Update documentation** if needed
6. **Submit a pull request** with a clear description

### PR Checklist

- [ ] Tests pass locally (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] TypeScript compiles without errors
- [ ] Documentation updated (if needed)
- [ ] Changes are focused and atomic

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # i18n routes
│   │   ├── (app)/         # Authenticated routes
│   │   └── (auth)/        # Public auth routes
│   ├── actions/           # Server Actions
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   └── dashboard/        # Dashboard components
├── lib/                   # Utilities and configurations
│   ├── db/               # Database schema and client
│   ├── auth.ts           # Better Auth configuration
│   └── utils.ts          # Utility functions
└── hooks/                # Custom React hooks
```

## Skills System

The project uses a skills system in `.agents/skills/` for AI-assisted development. When adding new features:

1. Check if a relevant skill exists
2. Follow patterns documented in skills
3. Update skills if you find better patterns

## Security

- Never commit `.env.local` or any secrets
- Use environment variables for sensitive data
- Follow security best practices in the `security-best-practices` skill

## Questions?

- Open an issue for bug reports or feature requests
- Join discussions for questions about architecture or patterns

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
