import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isHomePage = request.nextUrl.pathname === '/';
  const isInstitutionalPage = request.nextUrl.pathname === '/institutional';

  // Se estiver na página home ou institucional, não redireciona
  if (isHomePage || isInstitutionalPage) {
    return NextResponse.next();
  }

  // Se não estiver autenticado e tentar acessar uma página protegida
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se estiver autenticado e tentar acessar a página de login
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/protected/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 