import { DatabaseDesigner, DatabaseSchema } from '../DatabaseDesigner';

describe('DatabaseDesigner', () => {
  let designer: DatabaseDesigner;

  beforeEach(() => {
    designer = new DatabaseDesigner();
  });

  describe('generateSchema', () => {
    it('should generate basic Prisma schema with models', () => {
      const schema: DatabaseSchema = {
        models: [
          {
            id: 'model1',
            name: 'User',
            fields: [
              { id: 'f1', name: 'id', type: 'String', required: true, isPrimaryKey: true },
              { id: 'f2', name: 'email', type: 'String', required: true, unique: true },
              { id: 'f3', name: 'name', type: 'String', required: false },
            ],
          },
        ],
        relations: [],
      };

      const result = designer.generateSchema(schema, '/test');

      expect(result).toHaveLength(1);
      expect(result[0].path).toContain('schema.prisma');
      expect(result[0].content).toContain('model User');
      expect(result[0].content).toContain('id           String @id');
      expect(result[0].content).toContain('email        String @unique');
      expect(result[0].content).toContain('name         String?');
    });

    it('should generate schema with 1:N relationships', () => {
      const schema: DatabaseSchema = {
        models: [
          {
            id: 'model1',
            name: 'User',
            fields: [
              { id: 'f1', name: 'id', type: 'String', required: true, isPrimaryKey: true },
              { id: 'f2', name: 'email', type: 'String', required: true },
            ],
          },
          {
            id: 'model2',
            name: 'Post',
            fields: [
              { id: 'f3', name: 'id', type: 'String', required: true, isPrimaryKey: true },
              { id: 'f4', name: 'title', type: 'String', required: true },
            ],
          },
        ],
        relations: [
          {
            id: 'rel1',
            sourceModel: 'User',
            targetModel: 'Post',
            type: '1:N',
            sourceField: 'posts',
            targetField: 'author',
          },
        ],
      };

      const result = designer.generateSchema(schema, '/test');

      expect(result[0].content).toContain('posts        Post[]');
      expect(result[0].content).toContain('author       User?');
      expect(result[0].content).toContain('authorId     String?');
    });

    it('should generate schema with cascade delete', () => {
      const schema: DatabaseSchema = {
        models: [
          {
            id: 'model1',
            name: 'User',
            fields: [
              { id: 'f1', name: 'id', type: 'String', required: true, isPrimaryKey: true },
            ],
          },
          {
            id: 'model2',
            name: 'Post',
            fields: [
              { id: 'f2', name: 'id', type: 'String', required: true, isPrimaryKey: true },
            ],
          },
        ],
        relations: [
          {
            id: 'rel1',
            sourceModel: 'User',
            targetModel: 'Post',
            type: '1:N',
            onDelete: 'Cascade',
          },
        ],
      };

      const result = designer.generateSchema(schema, '/test');

      expect(result[0].content).toContain('onDelete: Cascade');
    });
  });

  describe('generateMigration', () => {
    it('should generate SQL migration file', () => {
      const schema: DatabaseSchema = {
        models: [
          {
            id: 'model1',
            name: 'User',
            fields: [
              { id: 'f1', name: 'id', type: 'String', required: true, isPrimaryKey: true },
              { id: 'f2', name: 'email', type: 'String', required: true, unique: true },
              { id: 'f3', name: 'createdAt', type: 'DateTime', required: true, default: 'now()' },
            ],
          },
        ],
        relations: [],
      };

      const result = designer.generateMigration(schema, 'init', '/test');

      expect(result).toHaveLength(1);
      expect(result[0].path).toContain('migration.sql');
      expect(result[0].content).toContain('CREATE TABLE "User"');
      expect(result[0].content).toContain('"id" TEXT NOT NULL PRIMARY KEY');
      expect(result[0].content).toContain('"email" TEXT NOT NULL UNIQUE');
      expect(result[0].content).toContain('"createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()');
    });

    it('should generate foreign key constraints', () => {
      const schema: DatabaseSchema = {
        models: [
          {
            id: 'model1',
            name: 'User',
            fields: [
              { id: 'f1', name: 'id', type: 'String', required: true, isPrimaryKey: true },
            ],
          },
          {
            id: 'model2',
            name: 'Post',
            fields: [
              { id: 'f2', name: 'id', type: 'String', required: true, isPrimaryKey: true },
            ],
          },
        ],
        relations: [
          {
            id: 'rel1',
            sourceModel: 'Post',
            targetModel: 'User',
            type: '1:N',
            sourceField: 'author',
            onDelete: 'Cascade',
          },
        ],
      };

      const result = designer.generateMigration(schema, 'add_posts', '/test');

      expect(result[0].content).toContain('AddForeignKey');
      expect(result[0].content).toContain('FOREIGN KEY');
      expect(result[0].content).toContain('ON DELETE CASCADE');
    });
  });

  describe('previewMigration', () => {
    it('should preview migration SQL', () => {
      const schema: DatabaseSchema = {
        models: [
          {
            id: 'model1',
            name: 'Product',
            fields: [
              { id: 'f1', name: 'id', type: 'String', required: true, isPrimaryKey: true },
              { id: 'f2', name: 'name', type: 'String', required: true },
              { id: 'f3', name: 'price', type: 'Float', required: true },
              { id: 'f4', name: 'inStock', type: 'Boolean', required: true },
            ],
          },
        ],
        relations: [],
      };

      const preview = designer.previewMigration(schema);

      expect(preview).toContain('CREATE TABLE "Product"');
      expect(preview).toContain('"name" TEXT NOT NULL');
      expect(preview).toContain('"price" DOUBLE PRECISION NOT NULL');
      expect(preview).toContain('"inStock" BOOLEAN NOT NULL');
    });
  });
});
