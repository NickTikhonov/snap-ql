# Schema Viewer Feature Specification

## Overview

The Schema Viewer is a new tab in SnapQL that allows users to browse their database schema visually. Users can see all tables at a glance with their column definitions, and click on any table to view sample data.

## User Interaction Flow

1. User clicks on "Schema Browser" tab
2. User sees all database tables displayed as cards/pills with their schema definitions
3. User clicks on a specific table card
4. View transitions to show:
   - Table name as header
   - Full schema definition
   - First 10-20 rows of sample data
   - Back button to return to schema overview

## UI Mockups

### Schema Overview View (All Tables)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Query Editor  │  Schema Browser  │                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Database Schema                                                    │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐         │
│  │ 📁 users                 │  │ 📁 products             │         │
│  ├─────────────────────────┤  ├─────────────────────────┤         │
│  │ id (bigint, primary key)│  │ id (bigint, primary key)│         │
│  │ name (varchar)          │  │ name (varchar)          │         │
│  │ email (varchar)         │  │ price (decimal)         │         │
│  │ created_at (timestamp)  │  │ created_at (timestamp)  │         │
│  └─────────────────────────┘  └─────────────────────────┘         │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐         │
│  │ 📁 orders               │  │ 📁 categories           │         │
│  ├─────────────────────────┤  ├─────────────────────────┤         │
│  │ id (bigint, primary key)│  │ id (bigint, primary key)│         │
│  │ user_id (bigint)        │  │ name (varchar)          │         │
│  │ total (decimal)         │  │ parent_id (bigint)      │         │
│  │ created_at (timestamp)  │  │ created_at (timestamp)  │         │
│  └─────────────────────────┘  └─────────────────────────┘         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Table Detail View (After Clicking a Table)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Query Editor  │  Schema Browser  │                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [← Back]     users                                                │
│                                                                     │
│  Schema:                                                            │
│  ┌─────────────────────────────────────────────────────────┐      │
│  │ Column        │ Type                    │ Constraints    │      │
│  ├─────────────────────────────────────────────────────────┤      │
│  │ id            │ bigint                  │ PRIMARY KEY    │      │
│  │ name          │ varchar(255)            │ NOT NULL       │      │
│  │ email         │ varchar(255)            │ UNIQUE         │      │
│  │ created_at    │ timestamp               │ DEFAULT NOW()  │      │
│  └─────────────────────────────────────────────────────────┘      │
│                                                                     │
│  Sample Data (First 10 rows):                                       │
│  ┌─────┬──────────────┬─────────────────────┬──────────────┐      │
│  │ id  │ name         │ email               │ created_at   │      │
│  ├─────┼──────────────┼─────────────────────┼──────────────┤      │
│  │ 1   │ John Doe     │ john@example.com    │ 2024-01-15   │      │
│  │ 2   │ Jane Smith   │ jane@example.com    │ 2024-01-16   │      │
│  │ ... │ ...          │ ...                 │ ...          │      │
│  └─────┴──────────────┴─────────────────────┴──────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Technical Implementation

### Backend Changes (Main Process)

#### 1. New IPC Handlers in `src/main/index.ts`

```typescript
// Get all tables with their schemas
ipcMain.handle('get-database-schema', async (event, connectionName: string) => {
  // Returns array of table objects with columns
})

// For sample data, we'll reuse the existing runQueryForConnection handler
// Just generate a query like: SELECT * FROM tableName LIMIT 10
```

#### 2. New Functions in `src/main/lib/db.ts`

```typescript
export async function getDatabaseSchema(connectionString: string): Promise<TableSchema[]> {
  // Query information_schema to get all tables and their columns
  // Return structured data with table names, columns, types, constraints
}

interface TableSchema {
  tableName: string
  columns: ColumnInfo[]
}

interface ColumnInfo {
  columnName: string
  dataType: string
  isNullable: boolean
  isPrimaryKey: boolean
  isUnique: boolean
  defaultValue: string | null
  maxLength: number | null
}
```

### Frontend Changes (Renderer Process)

#### 1. Update Preload Script (`src/preload/index.ts`)

```typescript
getDatabaseSchema: (connectionName: string) =>
  ipcRenderer.invoke('get-database-schema', connectionName)
// For sample data, we'll use the existing runQueryForConnection method
```

#### 2. New Components

##### `src/renderer/src/components/SchemaViewer.tsx`

- Main container component for schema browsing
- Manages state for current view (overview vs table detail)
- Handles navigation between views

##### `src/renderer/src/components/SchemaCard.tsx`

- Individual table card component
- Displays table name and column preview
- Clickable to navigate to detail view

##### `src/renderer/src/components/TableDetailView.tsx`

- Shows full schema definition in a table
- Displays sample data
- Back button navigation

#### 3. Update `src/renderer/src/App.tsx`

- Add "Schema Browser" tab to the main tab navigation
- Add SchemaViewer component to tab content
- Pass selected connection to SchemaViewer

#### 4. State Management

- Add state for:
  - Current schema view mode (overview/detail)
  - Selected table name
  - Schema data cache
  - Sample data cache

## Implementation Priority

1. Backend IPC handlers and database queries
2. Basic SchemaViewer component with overview
3. SchemaCard components
4. Table detail view with sample data
5. Navigation and animations
6. Error handling and loading states

## Considerations

- **Performance**: Cache schema data to avoid repeated queries
- **Security**: Ensure table names are properly escaped in queries
- **Large Databases**: Paginate or limit schema display for databases with many tables
- **Permissions**: Handle cases where user may not have access to certain tables
- **Data Types**: Map database-specific types to generic display format
