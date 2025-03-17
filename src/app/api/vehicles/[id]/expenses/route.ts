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
    const { type, description, amount } = body;

    // Primeiro, verificar o status atual do veículo
    const currentVehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      select: { status: true }
    });

    // Criar a despesa e atualizar o status do veículo em uma transação
    const [expense, vehicle] = await prisma.$transaction([
      prisma.expense.create({
        data: {
          id: uuidv4(),
          type,
          description,
          amount,
          vehicleId: params.id,
        },
        include: {
          receipts: true,
        },
      }),
      prisma.vehicle.update({
        where: { id: params.id },
        data: {
          // Só atualiza para 'in_preparation' se o status atual for 'acquired'
          status: currentVehicle?.status === 'acquired' ? 'in_preparation' : currentVehicle?.status,
        },
        include: {
          images: true,
          expenses: {
            orderBy: {
              date: 'desc'
            }
          },
          marketPrices: true,
          saleInfo: true,
        },
      }),
    ]);

    return NextResponse.json({ expense, vehicle }, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar despesa' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const expenseId = searchParams.get('expenseId');

    if (!expenseId) {
      return NextResponse.json(
        { error: 'ID da despesa não fornecido' },
        { status: 400 }
      );
    }

    // Primeiro excluir os comprovantes da despesa
    await prisma.expenseReceipt.deleteMany({
      where: {
        expenseId: expenseId,
      },
    });

    // Depois excluir a despesa
    await prisma.expense.delete({
      where: {
        id: expenseId,
      },
    });

    return NextResponse.json({ message: 'Despesa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir despesa' },
      { status: 500 }
    );
  }
} 