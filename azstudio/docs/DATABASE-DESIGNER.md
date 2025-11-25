# Database Schema Designer

The Database Schema Designer is a visual tool for designing database schemas and generating Prisma schema files with migrations.

## Features

### Visual Database Modeling Canvas

- **Drag-and-drop model creation**: Add database models to the canvas with a single click
- **Field management**: Add, edit, and remove fields with support for multiple data types
- **Visual relationships**: Draw connections between models to define relationships
- **Real-time updates**: Changes to the canvas are immediately reflected in the generated code

### Model Configuration

Each model supports:
- **Field types**: String, Int, Boolean, DateTime, Float, Json
- **Field attributes**:
  - Required/Optional
  - Unique constraints
  - Primary keys
  - Default values

### Relationship Types

The designer supports three types of relationships:

#### One-to-One (1:1)
Each record in Model A relates to exactly one record in Model B.

Example: User ↔ Profile

#### One-to-Many (1:N)
One record in Model A can relate to many records in Model B.

Example: User → Posts (one user has many posts)

#### Many-to-Many (N:M)
Many records in Model A can relate to many records in Model B.

Example: Students ↔ Courses (students can enroll in many courses, courses have many students)

### Relationship Configuration

For each relationship, you can configure:
- **Relationship type**: 1:1, 1:N, or N:M
- **Field names**: Custom names for relation fields in both models
- **On Delete actions** (for 1:1 and 1:N):
  - **Cascade**: Delete related records when parent is deleted
  - **Set Null**: Set foreign key to null when parent is deleted
  - **Restrict**: Prevent deletion if related records exist
  - **No Action**: Use database default behavior

## Usage

### Creating a Model

1. Click the "Add Model" button in the toolbar
2. A new model appears on the canvas with default fields (id, createdAt)
3. Click the model name to rename it
4. Add fields using the "+ Add Field" button

### Configuring Fields

For each field, you can:
- Edit the field name
- Select the data type from the dropdown
- Toggle "Required" (!) checkbox
- Toggle "Unique" (U) checkbox
- Delete the field using the "−" button

### Creating Relationships

1. Click and drag from the handle on the right side of a model
2. Connect to the handle on the left side of another model
3. A relationship line appears with default type "1:N"
4. Click the relationship line to configure it

### Generating Schema

Click "Generate Schema" to create a Prisma schema file from your visual design. The generated schema includes:
- All models with their fields
- Proper field types and attributes
- Relationship definitions with foreign keys
- Cascade rules and constraints

### Migration Preview

1. Click "Preview Migration" to see the SQL that will be generated
2. Review the CREATE TABLE statements and foreign key constraints
3. Enter a migration name (e.g., "add_user_posts")
4. Click "Execute Migration" to apply the changes

## Generated Code Examples

### Simple Model

Visual design:
```
┌─────────────┐
│    User     │
├─────────────┤
│ id: String  │
│ email: String (unique) │
│ name: String? │
└─────────────┘
```

Generated Prisma schema:
```prisma
model User {
  id           String @id
  email        String @unique
  name         String?
}
```

### One-to-Many Relationship

Visual design:
```
┌─────────────┐         ┌─────────────┐
│    User     │────────>│    Post     │
├─────────────┤   1:N   ├─────────────┤
│ id: String  │         │ id: String  │
│ email: String│         │ title: String│
└─────────────┘         └─────────────┘
```

Generated Prisma schema:
```prisma
model User {
  id           String @id
  email        String
  post         Post[]
}

model Post {
  id           String @id
  title        String
  user         User? @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       String?
}
```

### Migration SQL

For the above schema, the generated migration SQL would be:
```sql
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "userId" TEXT
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
```

## API Reference

### DatabaseDesigner Service

```typescript
import { DatabaseDesigner, DatabaseSchema } from './services/DatabaseDesigner';

const designer = new DatabaseDesigner();

// Generate Prisma schema
const schema: DatabaseSchema = {
  models: [...],
  relations: [...]
};

const schemaFiles = designer.generateSchema(schema, '/project/path');

// Generate migration
const migrationFiles = designer.generateMigration(
  schema, 
  'migration_name', 
  '/project/path'
);

// Preview migration SQL
const sql = designer.previewMigration(schema);
```

### DatabaseCanvas Component

```typescript
import DatabaseCanvas from './components/DatabaseCanvas';

<DatabaseCanvas
  onSchemaChange={(nodes, edges) => {
    // Handle schema changes
  }}
  onGenerateSchema={() => {
    // Generate Prisma schema file
  }}
  onPreviewMigration={() => {
    // Return migration SQL for preview
    return migrationSQL;
  }}
  onExecuteMigration={async (migrationName) => {
    // Execute the migration
  }}
/>
```

## Best Practices

1. **Start with core models**: Define your main entities first (User, Product, etc.)
2. **Add relationships incrementally**: Connect models one relationship at a time
3. **Use meaningful names**: Choose clear, descriptive names for models and fields
4. **Review migrations**: Always preview migrations before executing them
5. **Backup your database**: Create backups before running migrations in production
6. **Use cascade carefully**: Consider the implications of cascade deletes
7. **Test locally first**: Test your schema changes in development before production

## Keyboard Shortcuts

- **Delete**: Remove selected model or relationship
- **Ctrl/Cmd + Z**: Undo last change
- **Ctrl/Cmd + C**: Copy selected model
- **Ctrl/Cmd + V**: Paste copied model

## Troubleshooting

### Relationship not appearing
- Ensure both models exist on the canvas
- Check that you're connecting from source (right handle) to target (left handle)

### Migration fails
- Verify database connection string
- Check for conflicting constraints
- Review SQL syntax in preview

### Schema not generating
- Ensure all models have at least one field
- Check that model names are valid identifiers
- Verify relationship configurations are complete

## Future Enhancements

- Import existing Prisma schemas
- Visual diff for schema changes
- Database reverse engineering
- Index management
- Enum type support
- Composite keys
- Custom validation rules
