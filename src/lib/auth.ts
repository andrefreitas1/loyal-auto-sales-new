import { type NextAuthOptions } from 'next-auth';
import type { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

type UserRole = 'admin' | 'operator';

interface ExtendedUser extends DefaultUser {
  role: UserRole;
}

interface ExtendedJWT extends JWT {
  role?: UserRole;
}

interface ExtendedSession extends DefaultSession {
  user?: ExtendedUser;
}

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
          };
        } catch (error) {
          console.error('Erro durante autenticação:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }): Promise<ExtendedJWT> {
      if (user) {
        token.role = (user as ExtendedUser).role;
      }
      return token;
    },
    async session({ session, token }): Promise<ExtendedSession> {
      if (session?.user) {
        (session.user as ExtendedUser).role = token.role as UserRole;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 