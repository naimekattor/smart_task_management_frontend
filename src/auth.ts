import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        isDemo: { label: 'IsDemo', type: 'text' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials): Promise<any> {
        try {
          const isDemo = credentials?.isDemo === 'true';
          
          let response;
          if (isDemo) {
            response = await fetch(`${BACKEND_URL}/auth/demo-login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: credentials?.role }),
            });
          } else {
            response = await fetch(`${BACKEND_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
            });
          }

          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            console.error('[NextAuth Authorize Error]:', errBody);
            return null;
          }

          const resData = await response.json();
          if (resData && resData.success) {
            const { user, accessToken } = resData.data;
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatarUrl: user.avatarUrl,
              accessToken,
            };
          }
          return null;
        } catch (error: any) {
          console.error('[NextAuth Authorize Error]:', error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatarUrl = user.avatarUrl;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.avatarUrl = token.avatarUrl as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'smart_nextauth_secret_key_2026_xyz',
});
