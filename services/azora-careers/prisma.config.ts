export default {
  migrate: { connectionString: process.env.DATABASE_URL },
  schema: './prisma/schema.prisma'
};
