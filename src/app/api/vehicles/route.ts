import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import cloudinary from '@/lib/cloudinary';

// Definir que esta rota é dinâmica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const prisma = new PrismaClient();

async function uploadToCloudinary(file: File) {
  try {
    // Converter o arquivo para um buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Fazer o upload para o Cloudinary usando stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'vehicles',
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Enviar o buffer para o stream de upload
      const bufferStream = require('stream').Readable.from(buffer);
      bufferStream.pipe(uploadStream);
    });

    return result.secure_url;
  } catch (error) {
    console.error('Erro ao fazer upload para o Cloudinary:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extrair dados do veículo
    const brand = formData.get('brand') as string;
    const model = formData.get('model') as string;
    const year = parseInt(formData.get('year') as string);
    const color = formData.get('color') as string;
    const vin = formData.get('vin') as string;
    const mileage = parseFloat(formData.get('mileage') as string);
    const purchasePrice = parseFloat(formData.get('purchasePrice') as string);
    const images = formData.getAll('images') as File[];

    // Upload das imagens
    const imageUrls = await Promise.all(
      images.map(image => uploadToCloudinary(image))
    );

    // Criar veículo no banco de dados
    const vehicle = await prisma.vehicle.create({
      data: {
        brand,
        model,
        year,
        color,
        vin,
        mileage,
        purchasePrice,
        images: {
          create: imageUrls.map(url => ({
            url
          }))
        }
      },
      include: {
        images: true
      }
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar veículo: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        images: true,
        expenses: true,
        marketPrices: true,
        saleInfo: true
      }
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar veículos: ' + (error instanceof Error ? error.message : 'Erro desconhecido') },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 