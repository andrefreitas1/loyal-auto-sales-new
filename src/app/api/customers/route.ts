import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const customer = await prisma.customer.create({
      data: {
        ...data,
        status: 'new',
        statusUpdatedAt: new Date(),
        operatorId: session.user.id,
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

    // Criar o primeiro registro no histórico
    await prisma.customerStatusHistory.create({
      data: {
        customerId: customer.id,
        status: 'new',
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const customers = await prisma.customer.findMany({
      where: session.user.role === 'admin' 
        ? undefined 
        : { operatorId: session.user.id },
      include: {
        operator: true,
        vehicle: {
          include: {
            marketPrices: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    );
  }
} 