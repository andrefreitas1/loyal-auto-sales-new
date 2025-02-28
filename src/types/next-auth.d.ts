import { DefaultSession } from 'next-auth';

type Role = 'admin' | 'operator';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: Role;
  }
} 