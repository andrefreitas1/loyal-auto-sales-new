import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { salePrice, hasCommission, commissionValue } = body;

    const [saleInfo, vehicle] = await Promise.all([
      prisma.saleInfo.create({
        data: {
          id: uuidv4(),
          salePrice,
          vehicleId: params.id,
        },
      }),
      prisma.vehicle.update({
        where: { id: params.id },
        data: { status: 'sold' },
      }),
    ]);

    if (hasCommission && commissionValue > 0) {
      await prisma.expense.create({
        data: {
          id: uuidv4(),
          type: 'other',
          description: 'Comissão de Vendas',
          amount: commissionValue,
          date: new Date(),
          vehicleId: params.id,
        },
      });
    }

    return NextResponse.json({ saleInfo, vehicle }, { status: 200 });
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar venda' },
      { status: 500 }
    );
  }
} 