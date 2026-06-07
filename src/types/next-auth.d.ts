import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER';
      avatarUrl?: string;
    } & DefaultSession['user'];
    accessToken?: string;
  }

  interface User {
    id?: string;
    role: 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER';
    avatarUrl?: string;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER';
    avatarUrl?: string;
    accessToken?: string;
  }
}
