import { FileChange } from './ChangesetManager';
import * as path from 'path';

export interface DatabaseModel {
  id: string;
  name: string;
  fields: ModelField[];
  relations?: ModelRelation[];
}

export interface ModelField {
  id: string;
  name: string;
  type: 'String' | 'Int' | 'Boolean' | 'DateTime' | 'Float' | 'Json';
  required: boolean;
  unique?: boolean;
  default?: string;
  isPrimaryKey?: boolean;
}

export interface ModelRelation {
  id: string;
  sourceModel: string;
  targetModel: string;
  type: '1:1' | '1:N' | 'N:M';
  sourceField?: string;
  targetField?: string;
  onDelete?: 'Cascade' | 'SetNull' | 'Restrict' | 'NoAction';
}

export interface DatabaseSchema {
  models: DatabaseModel[];
  relations: ModelRelation[];
}

export class DatabaseDesigner {
  generateSchema(schema: DatabaseSchema, outputDir: string): FileChange[] {
    const schemaPath = path.join(outputDir, 'prisma', 'schema.prisma');

    return [{
      path: schemaPath,
      type: 'create',
      content: this.generatePrismaSchema(schema),
    }];
  }

  generateMigration(schema: DatabaseSchema, migrationName: string, outputDir: string): FileChange[] {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const migrationDir = path.join(outputDir, 'prisma', 'migrations', `${timestamp}_${migrationName}`);
    const migrationPath = path.join(migrationDir, 'migration.sql');

    return [{
      path: migrationPath,
      type: 'create',
      content: this.generateMigrationSQL(schema),
    }];
  }

  private generatePrismaSchema(schema: DatabaseSchema): string {
    let output = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;

    // Build relation map for easier lookup (both source and target)
    const relationMap = new Map<string, ModelRelation[]>();
    for (const relation of schema.relations) {
      // Add to source model
      if (!relationMap.has(relation.sourceModel)) {
        relationMap.set(relation.sourceModel, []);
      }
      relationMap.get(relation.sourceModel)!.push(relation);
      
      // Add to target model (for reverse relation)
      if (!relationMap.has(relation.targetModel)) {
        relationMap.set(relation.targetModel, []);
      }
      relationMap.get(relation.targetModel)!.push(relation);
    }

    // Generate models
    for (const model of schema.models) {
      output += `model ${model.name} {\n`;

      // Add fields
      for (const field of model.fields) {
        const required = field.required ? '' : '?';
        const unique = field.unique ? ' @unique' : '';
        const defaultValue = field.default ? ` @default(${field.default})` : '';
        const primaryKey = field.isPrimaryKey ? ' @id' : '';
        
        output += `  ${field.name.padEnd(12)} ${field.type}${required}${primaryKey}${defaultValue}${unique}\n`;
      }

      // Add relations
      const modelRelations = relationMap.get(model.name) || [];
      const processedRelations = new Set<string>();
      
      for (const relation of modelRelations) {
        // Avoid duplicates
        if (!processedRelations.has(relation.id)) {
          output += this.generateRelationField(relation, model.name);
          processedRelations.add(relation.id);
        }
      }

      output += `}\n\n`;
    }

    return output;
  }

  private generateRelationField(relation: ModelRelation, currentModel: string): string {
    const isSource = relation.sourceModel === currentModel;
    const relatedModel = isSource ? relation.targetModel : relation.sourceModel;
    const fieldName = isSource 
      ? (relation.sourceField || relatedModel.toLowerCase())
      : (relation.targetField || relation.sourceModel.toLowerCase());

    let output = '';

    if (relation.type === '1:1') {
      if (isSource) {
        output += `  ${fieldName.padEnd(12)} ${relatedModel}? @relation(fields: [${fieldName}Id], references: [id])\n`;
        output += `  ${(fieldName + 'Id').padEnd(12)} String?\n`;
      }
    } else if (relation.type === '1:N') {
      if (isSource) {
        // Source side: array of related models
        output += `  ${fieldName.padEnd(12)} ${relatedModel}[]\n`;
      } else {
        // Target side: single related model with foreign key
        output += `  ${fieldName.padEnd(12)} ${relatedModel}? @relation(fields: [${fieldName}Id], references: [id]${relation.onDelete ? `, onDelete: ${relation.onDelete}` : ''})\n`;
        output += `  ${(fieldName + 'Id').padEnd(12)} String?\n`;
      }
    } else if (relation.type === 'N:M') {
      output += `  ${fieldName.padEnd(12)} ${relatedModel}[]\n`;
    }

    return output;
  }

  private generateMigrationSQL(schema: DatabaseSchema): string {
    let sql = '-- CreateTable\n';

    for (const model of schema.models) {
      sql += `CREATE TABLE "${model.name}" (\n`;

      const columns: string[] = [];
      for (const field of model.fields) {
        const sqlType = this.getSQLType(field.type);
        const notNull = field.required ? ' NOT NULL' : '';
        const unique = field.unique ? ' UNIQUE' : '';
        const primaryKey = field.isPrimaryKey ? ' PRIMARY KEY' : '';
        const defaultValue = field.default ? ` DEFAULT ${this.getSQLDefault(field.default, field.type)}` : '';
        
        columns.push(`    "${field.name}" ${sqlType}${notNull}${primaryKey}${defaultValue}${unique}`);
      }

      sql += columns.join(',\n');
      sql += '\n);\n\n';
    }

    // Add foreign key constraints
    for (const relation of schema.relations) {
      if (relation.type === '1:1' || relation.type === '1:N') {
        const sourceField = relation.sourceField || relation.targetModel.toLowerCase();
        sql += `-- AddForeignKey\n`;
        sql += `ALTER TABLE "${relation.sourceModel}" ADD CONSTRAINT "${relation.sourceModel}_${sourceField}Id_fkey" `;
        sql += `FOREIGN KEY ("${sourceField}Id") REFERENCES "${relation.targetModel}"("id")`;
        if (relation.onDelete) {
          sql += ` ON DELETE ${relation.onDelete.toUpperCase()}`;
        }
        sql += ';\n\n';
      }
    }

    return sql;
  }

  private getSQLType(prismaType: string): string {
    const typeMap: Record<string, string> = {
      String: 'TEXT',
      Int: 'INTEGER',
      Boolean: 'BOOLEAN',
      DateTime: 'TIMESTAMP(3)',
      Float: 'DOUBLE PRECISION',
      Json: 'JSONB',
    };
    return typeMap[prismaType] || 'TEXT';
  }

  private getSQLDefault(defaultValue: string, type: string): string {
    if (defaultValue === 'now()' || defaultValue === 'cuid()' || defaultValue === 'uuid()') {
      return defaultValue.toUpperCase() + '()';
    }
    if (type === 'String') {
      return `'${defaultValue}'`;
    }
    return defaultValue;
  }

  previewMigration(schema: DatabaseSchema): string {
    return this.generateMigrationSQL(schema);
  }
}
