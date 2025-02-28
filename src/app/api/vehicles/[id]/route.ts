import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      include: {
        images: true,
        expenses: true,
        marketPrices: true,
        saleInfo: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Veículo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar veículo' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      brand,
      model,
      year,
      color,
      vin,
      mileage,
      purchasePrice,
      purchaseDate,
      marketPrices
    } = body;

    // Atualizar o veículo
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        brand,
        model,
        year,
        color,
        vin,
        mileage,
        purchasePrice,
        purchaseDate: new Date(purchaseDate),
      },
    });

    // Atualizar ou criar preços de mercado
    if (marketPrices) {
      await prisma.marketPrice.upsert({
        where: { vehicleId: params.id },
        create: {
          vehicleId: params.id,
          wholesale: marketPrices.wholesale || 0,
          mmr: marketPrices.mmr || 0,
          retail: marketPrices.retail || 0,
          repasse: marketPrices.repasse || 0,
        },
        update: {
          wholesale: marketPrices.wholesale || 0,
          mmr: marketPrices.mmr || 0,
          retail: marketPrices.retail || 0,
          repasse: marketPrices.repasse || 0,
        },
      });
    }

    // Buscar veículo atualizado com todos os detalhes
    const vehicleWithDetails = await prisma.vehicle.findUnique({
      where: { id: params.id },
      include: {
        images: true,
        expenses: true,
        marketPrices: true,
        saleInfo: true,
      },
    });

    return NextResponse.json(vehicleWithDetails);
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar veículo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Primeiro, excluir todos os registros relacionados
    await Promise.all([
      prisma.expense.deleteMany({
        where: { vehicleId: params.id },
      }),
      prisma.image.deleteMany({
        where: { vehicleId: params.id },
      }),
      prisma.marketPrice.delete({
        where: { vehicleId: params.id },
      }).catch(() => {}), // Ignora erro se não existir
      prisma.saleInfo.delete({
        where: { vehicleId: params.id },
      }).catch(() => {}), // Ignora erro se não existir
    ]);

    // Depois, excluir o veículo
    await prisma.vehicle.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Veículo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir veículo:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir veículo' },
      { status: 500 }
    );
  }
} 