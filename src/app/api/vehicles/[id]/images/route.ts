import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Upload de imagens
export async function POST(
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
    const { imageUrl } = data;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Veículo não encontrado' },
        { status: 404 }
      );
    }

    const image = await prisma.vehicleImage.create({
      data: {
        url: imageUrl,
        vehicleId: params.id,
      },
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('Erro ao adicionar imagem:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar imagem' },
      { status: 500 }
    );
  }
}

// Remover imagem
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

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json(
        { error: 'ID da imagem não fornecido' },
        { status: 400 }
      );
    }

    const image = await prisma.vehicleImage.findFirst({
      where: {
        id: imageId,
        vehicleId: params.id,
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem não encontrada' },
        { status: 404 }
      );
    }

    await prisma.vehicleImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover imagem:', error);
    return NextResponse.json(
      { error: 'Erro ao remover imagem' },
      { status: 500 }
    );
  }
} 