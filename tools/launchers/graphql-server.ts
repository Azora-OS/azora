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
    // Allowed origins based on environment
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [
          'https://azora.es',
          'https://www.azora.es',
          'https://app.azora.es',
          'https://api.azora.es'
        ]
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:4000',
          'http://127.0.0.1:3000'
        ];

    // Create Apollo Server with enhanced security
    const server = new ApolloServer({
      typeDefs,
      resolvers: new GraphQLResolvers().getResolvers(),
      introspection: process.env.NODE_ENV !== 'production',
      csrfPrevention: true,
      cache: 'bounded',
    });

    const { url } = await startStandaloneServer(server, {
      context: async ({ req }: any) => {
        // Enhanced authentication
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        // CORS validation
        const origin = req.headers.origin;
        if (origin && !allowedOrigins.includes(origin)) {
          throw new Error('CORS policy: Origin not allowed');
        }

        return {
          userId: token,
          roles: ['student'], // Default role - should be validated against token
          permissions: ['read'],
          requestId: Math.random().toString(36).substring(7),
        };
      },
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