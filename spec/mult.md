# Multiple Database Connections Architecture

## Overview

This document outlines the architecture for supporting multiple database connections in SnapQL, allowing users to manage and switch between different database environments with isolated metadata, history, and settings.

## File Structure

```
~/SnapQL/
├── settings.json                 # Global AI model settings
├── connections/
│   ├── production/
│   │   ├── settings.json         # Connection settings & metadata
│   │   ├── history.json          # Query history (last 20)
│   │   └── favorites.json        # Saved favorite queries
│   ├── staging/
│   │   ├── settings.json
│   │   ├── history.json
│   │   └── favorites.json
│   └── ...
```

## Data Models

### Global Settings (`settings.json`)

```typescript
{
  aiProvider: 'openai' | 'claude',
  openAiKey?: string,
  openAiBaseUrl?: string,
  openAiModel?: string,
  claudeApiKey?: string,
  claudeModel?: string,
}
```

### Connection Settings (`connections/{name}/settings.json`)

```typescript
{
  connectionString: string,
  promptExtension?: string,
}
```

### Per-Connection Data

- **History**: Isolated query history (last 20 queries per connection)
- **Favorites**: Connection-specific saved queries
- **Prompt Extension**: Custom AI prompt context stored in connection settings

## State Management Changes

### Current State Layer (`src/main/lib/state.ts`)

- Migrate from single connection to multi-connection architecture
- Add connection CRUD operations
- Maintain backward compatibility with existing single-connection setup

### New Functions

```typescript
// Connection management
createConnection(name: string, connectionMetadata: ConnectionMetadata): Promise<void>
editConnection(name: string, connectionMetadata: ConnectionMetadata): Promise<void>
listConnections(): Promise<string[]>
getConnection(name: string): Promise<ConnectionMetadata>
deleteConnection(name: string): Promise<void>
getConnectionHistory(name: string): Promise<QueryHistory[]>
getConnectionFavorites(name: string): Promise<Favorite[]>
```
