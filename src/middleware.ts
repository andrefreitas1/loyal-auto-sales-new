import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/protected');

  // Se estiver tentando acessar uma página de autenticação e já estiver logado
  if (isAuthPage && token) {
    // Redireciona operadores para vehicles-for-sale e admins para dashboard
    const redirectUrl = token.role === 'operator' 
      ? '/protected/vehicles-for-sale' 
      : '/protected/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Se estiver tentando acessar uma rota protegida e não estiver logado
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/protected/:path*', '/login']
}; 