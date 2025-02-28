import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'loyal-auto-sales-secret-key-2024';

// Rotas que não precisam de autenticação
const publicRoutes = ['/', '/api/auth/login'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log('Middleware - Verificando rota:', path);

  // Verificar se é uma rota pública
  if (publicRoutes.includes(path)) {
    console.log('Rota pública detectada:', path);
    return NextResponse.next();
  }

  // Verificar se é uma rota de API pública
  if (path.startsWith('/api/auth/')) {
    console.log('Rota de API pública detectada:', path);
    return NextResponse.next();
  }

  // Verificar token de autenticação
  const token = request.cookies.get('auth_token')?.value;
  console.log('Token encontrado:', token ? 'Sim' : 'Não');

  if (!token) {
    console.log('Token não encontrado, redirecionando para login');
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    // Verificar se o token é válido usando jose
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    console.log('Token válido para usuário:', payload.email);
    return NextResponse.next();
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// Configurar quais rotas devem ser protegidas
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/vehicles/:path*',
    '/users/:path*',
    '/reports/:path*',
    '/api/:path*'
  ],
}; 