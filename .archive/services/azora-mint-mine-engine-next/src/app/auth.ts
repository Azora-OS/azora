import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // For demo purposes, accept any email/password
        if (credentials?.email && credentials?.password) {
          return {
            id: '1',
            email: credentials.email as string,
            name: 'Demo User',
            subscription: 'free' // free, basic, premium
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.subscription = (user as any).subscription
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).subscription = token.subscription
      }
      return session
    }
  }
})

