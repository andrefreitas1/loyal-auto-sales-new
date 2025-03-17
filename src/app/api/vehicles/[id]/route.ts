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

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        brand: true,
        model: true,
        year: true,
        mileage: true,
        purchasePrice: true,
        commissionValue: true,
        purchaseDate: true,
        status: true,
        color: true,
        vin: true,
        description: true,
        images: {
          select: {
            id: true,
            url: true
          }
        },
        expenses: {
          select: {
            id: true,
            type: true,
            description: true,
            amount: true,
            date: true,
            receipts: {
              select: {
                id: true,
                url: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        },
        marketPrices: {
          select: {
            wholesale: true,
            mmr: true,
            retail: true,
            repasse: true
          }
        },
        saleInfo: {
          select: {
            salePrice: true,
            saleDate: true
          }
        }
      }
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
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      brand,
      model,
      year,
      mileage,
      purchasePrice,
      purchaseDate,
      marketPrices,
      color,
      vin,
      description,
      images,
      commissionValue,
    } = data;

    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        brand,
        model,
        year,
        mileage,
        purchasePrice,
        purchaseDate,
        color,
        vin,
        description,
        commissionValue,
        marketPrices: marketPrices
          ? {
              upsert: {
                create: marketPrices,
                update: marketPrices,
              },
            }
          : undefined,
        images: images
          ? {
              create: images.map((url: string) => ({ url })),
            }
          : undefined,
      },
      include: {
        images: true,
        expenses: {
          orderBy: {
            date: 'desc',
          },
        },
        marketPrices: true,
        saleInfo: true,
      },
    });

    return NextResponse.json(vehicle);
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
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Primeiro, excluir todos os registros relacionados
    await prisma.$transaction([
      prisma.expense.deleteMany({
        where: { vehicleId: params.id },
      }),
      prisma.image.deleteMany({
        where: { vehicleId: params.id },
      }),
      prisma.marketPrice.deleteMany({
        where: { vehicleId: params.id },
      }),
      prisma.saleInfo.deleteMany({
        where: { vehicleId: params.id },
      }),
      prisma.vehicle.delete({
        where: { id: params.id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir veículo:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir veículo' },
      { status: 500 }
    );
  }
} 