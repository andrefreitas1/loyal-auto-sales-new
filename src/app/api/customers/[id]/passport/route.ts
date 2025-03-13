import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      select: {
        passportUrl: true,
        fullName: true,
        operatorId: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem permissão para ver este cliente
    if (session.user.role !== 'admin' && customer.operatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const response = await fetch(customer.passportUrl);
    if (!response.ok) {
      throw new Error('Erro ao buscar passaporte');
    }

    const blob = await response.blob();
    const headers = new Headers(response.headers);
    headers.set('Content-Disposition', `attachment; filename="passaporte_${customer.fullName.replace(/\s+/g, '_')}.${headers.get('content-type')?.includes('jpeg') ? 'jpg' : headers.get('content-type')?.includes('png') ? 'png' : 'pdf'}`);

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Erro ao baixar passaporte:', error);
    return NextResponse.json(
      { error: 'Erro ao baixar passaporte' },
      { status: 500 }
    );
  }
} 