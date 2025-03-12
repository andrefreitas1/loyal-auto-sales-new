import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

// Criar uma única instância do PrismaClient
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'loyal-auto-sales-secret-key-2024';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Tentativa de login para:', email);

    // Buscar usuário pelo email usando Prisma Client
    const userData = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    console.log('Usuário encontrado:', userData ? 'Sim' : 'Não');

    if (!userData) {
      console.log('Usuário não encontrado para o email:', email);
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário está ativo
    console.log('Status do usuário:', userData.active ? 'Ativo' : 'Inativo');
    if (!userData.active) {
      console.log('Tentativa de login com usuário inativo:', email);
      return NextResponse.json(
        { error: 'Usuário inativo' },
        { status: 401 }
      );
    }

    // Verificar senha
    console.log('Verificando senha...');
    const validPassword = await bcrypt.compare(password, userData.password);
    console.log('Senha válida:', validPassword ? 'Sim' : 'Não');
    
    if (!validPassword) {
      console.log('Senha incorreta para o usuário:', email);
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    // Gerar token JWT usando jose
    console.log('Gerando token JWT...');
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ 
      userId: userData.id,
      email: userData.email,
      role: userData.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secret);

    // Criar resposta com cookie
    console.log('Criando resposta com cookie...');
    const response = NextResponse.json(
      { 
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role
        },
        token // Incluindo o token na resposta para ser salvo no localStorage
      },
      { status: 200 }
    );

    // Definir cookie com o token
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 dia
    });

    console.log('Login bem-sucedido para:', email);
    return response;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 