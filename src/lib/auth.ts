import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.$queryRaw`
            SELECT id, email, name, password, role, active
            FROM User
            WHERE email = ${credentials.email}
          `;

          if (!user || !Array.isArray(user) || user.length === 0) {
            return null;
          }

          const userData = user[0];

          if (!userData.active) {
            return null;
          }

          const validPassword = await bcrypt.compare(credentials.password, userData.password);
          
          if (!validPassword) {
            return null;
          }

          return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        } finally {
          await prisma.$disconnect();
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
      }
      return session;
    }
  }
}; 