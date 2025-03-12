import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    // Validar status permitidos
    const allowedStatus = ['acquired', 'in_preparation', 'for_sale', 'sold'];
    if (!allowedStatus.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: { status },
      include: {
        images: true,
        expenses: true,
        marketPrices: true,
        saleInfo: true,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Erro ao atualizar status do veículo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar status do veículo' },
      { status: 500 }
    );
  }
} 