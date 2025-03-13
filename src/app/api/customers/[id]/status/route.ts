import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const { status } = data;

    // Validar status
    const validStatus = ['new', 'analysis', 'approved', 'rejected'];
    if (!validStatus.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: { 
        status,
        statusUpdatedAt: new Date(),
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

    // Registrar histórico de status
    await prisma.customerStatusHistory.create({
      data: {
        customerId: params.id,
        status,
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Erro ao atualizar status do cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar status do cliente' },
      { status: 500 }
    );
  }
} 