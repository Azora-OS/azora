/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLResolvers, typeDefs } from './azora-lms/core/graphql-unified-gateway.js';

async function startGraphQLServer() {
  try {
    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers: new GraphQLResolvers().getResolvers(),
    });

    const { url } = await startStandaloneServer(server, {
      context: async ({ req }: any) => ({
        userId: req.headers.authorization?.replace('Bearer ', ''),
        roles: ['student'], // Default role
        permissions: ['read'],
        requestId: Math.random().toString(36).substring(7),
      }),
      listen: { port: 4000 },
    });

    console.log(`🚀 GraphQL server ready at ${url}`);
    console.log(`     Port: 4000`);
    console.log(`     Endpoint: http://localhost:4000/graphql`);

    return server;
  } catch (error) {
    console.error('Failed to start GraphQL server:', error);
    throw error;
  }
}

async function main() {
  await startGraphQLServer().catch(console.error);

  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down GraphQL server...');
    process.exit(0);
  });

  // Keep alive
  await new Promise(() => {});
}

main().catch(console.error);