import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return new NextResponse('Acesso negado', { status: 403 });
    }

    const body = await request.json();
    const { isRead } = body;

    const contact = await prisma.contact.update({
      where: {
        id: params.id
      },
      data: {
        status: isRead ? 'read' : 'unread'
      }
    });

    return NextResponse.json({
      id: contact.id,
      isRead: contact.status === 'read'
    });
  } catch (error) {
    console.error('[CONTACT_READ]', error);
    return new NextResponse('Erro interno', { status: 500 });
  }
} 