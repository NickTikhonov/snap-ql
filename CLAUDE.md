# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Development
npm run dev              # Start development server with hot reload
npm run start           # Preview built application

# Code Quality (run these before committing)
npm run lint            # ESLint checking
npm run format          # Prettier formatting
npm run typecheck       # TypeScript type checking (both node and web)

# Testing
npm test                # Run unit tests for main process
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report

# Building
npm run build           # Full production build with type checking
npm run build:mac       # Build macOS distribution
npm run build:win       # Build Windows distribution
npm run build:linux     # Build Linux distribution
npm run build:unpack    # Build without packaging for testing
```

## Project Architecture

**SnapQL** is an Electron-based desktop app for AI-powered PostgreSQL database exploration and query generation.

### Core Structure

- **Main Process** (`src/main/`): Database connections, AI integration, settings management
- **Renderer Process** (`src/renderer/src/`): React frontend with TailwindCSS + Radix UI
- **Preload Script** (`src/preload/`): Secure IPC bridge between main and renderer

### Key Files

- `src/main/lib/db.ts` - Database operations and AI query generation logic
- `src/main/lib/ai.ts` - Query generation logic
- `src/main/lib/state.ts` - Settings management (stored in `~/SnapQL/settings.json`)
- `src/renderer/src/App.tsx` - Main React application component
- `src/renderer/src/components/` - UI components (AIChat, SQLEditor, ResultsTable, Settings)

### Tech Stack

- **Electron** (v35.1.5) + **React** (v19.1.0) + **TypeScript**
- **Vite/electron-vite** for building
- **TailwindCSS** + **Radix UI** for styling/components
- **CodeMirror** for SQL syntax highlighting
- **OpenAI SDK** + **Vercel AI SDK** for AI query generation
- **PostgreSQL** (pg client) for database connectivity
- **ShadCN/UI** as the UI/UX framework

### Security Architecture

- Sandboxed renderer process with context isolation
- No direct Node.js access from renderer
- Database credentials stored locally only
- Secure IPC communication patterns

### Development Notes

- Uses multi-config TypeScript setup (node, web, main)
- Hot reload enabled in development mode
- Settings auto-saved to `~/SnapQL/settings.json`
- Query history stored (last 20 queries)
- Cross-platform builds supported (macOS, Windows, Linux)

### Testing

- **Jest** configured for unit testing main process code
- Tests located in `src/main/__tests__/`
- Isolated from Electron environment for pure Node.js testing
- TypeScript support with ts-jest preprocessor

### Development Warnings

- Don't run "npm run dev" to test

### Development Best Practices

- When working on end-user features make sure to update README.md when relevant

### AI Interaction Guidelines

- Always generate an implementation plan and ask me to confirm before proceeding to implementation
