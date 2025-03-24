import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isHomePage = request.nextUrl.pathname === '/';
  const isInstitutionalPage = request.nextUrl.pathname === '/institutional';
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/protected');
  const isDashboardPage = request.nextUrl.pathname === '/protected/dashboard';
  const userRole = token?.role as string;

  // Se estiver na página home ou institucional, não redireciona
  if (isHomePage || isInstitutionalPage) {
    return NextResponse.next();
  }

  // Se não estiver autenticado e tentar acessar uma página protegida
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se for operador e tentar acessar o dashboard
  if (userRole === 'operator' && isDashboardPage) {
    return NextResponse.redirect(new URL('/protected/vehicles-for-sale', request.url));
  }

  // Se estiver autenticado e tentar acessar a página de login
  if (token && isAuthPage) {
    // Redireciona para vehicles-for-sale se for operador, senão para dashboard
    const redirectUrl = userRole === 'operator' ? '/protected/vehicles-for-sale' : '/protected/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 