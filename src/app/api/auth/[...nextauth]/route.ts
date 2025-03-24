import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Desabilitar geração estática para esta rota
export const dynamic = 'force-dynamic'; 