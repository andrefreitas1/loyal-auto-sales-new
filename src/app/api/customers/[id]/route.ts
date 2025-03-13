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
      include: {
        operator: true,
        vehicle: {
          include: {
            images: true,
            marketPrices: true,
          },
        },
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

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cliente' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { fullName, birthDate, phone, email } = data;

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: { 
        fullName,
        birthDate: new Date(birthDate),
        phone,
        email,
      },
      include: {
        operator: true,
        vehicle: {
          include: {
            marketPrices: true,
            images: true,
          },
        },
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Primeiro, excluir registros relacionados
    await prisma.$transaction(async (prisma) => {
      // Excluir histórico de status
      await prisma.customerStatusHistory.deleteMany({
        where: { customerId: params.id },
      });

      // Excluir o cliente
      await prisma.customer.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir cliente' },
      { status: 500 }
    );
  }
} 