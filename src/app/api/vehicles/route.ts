import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '@/lib/cloudinary';

const prisma = new PrismaClient();

async function uploadToCloudinary(file: File) {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Converter o buffer para base64
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;
    
    // Upload para o Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'vehicles',
      resource_type: 'auto'
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
    const vehicleData: Prisma.VehicleCreateInput = {
      id: uuidv4(),
      brand: formData.get('brand') as string || '',
      model: formData.get('model') as string || '',
      year: parseInt(formData.get('year') as string) || 0,
      color: formData.get('color') as string || '',
      vin: formData.get('vin') as string || '',
      mileage: parseFloat(formData.get('mileage') as string) || 0,
      purchasePrice: parseFloat(formData.get('purchasePrice') as string) || 0,
      purchaseDate: new Date(formData.get('purchaseDate') as string),
      status: 'acquired',
      marketPrices: {
        create: {
          id: uuidv4(),
          wholesale: parseFloat(formData.get('wholesale') as string) || 0,
          mmr: parseFloat(formData.get('mmr') as string) || 0,
          retail: parseFloat(formData.get('retail') as string) || 0,
          repasse: parseFloat(formData.get('repasse') as string) || 0
        }
      }
    };

    const vehicle = await prisma.vehicle.create({
      data: vehicleData,
      include: {
        marketPrices: true
      }
    });

    const images = formData.getAll('images') as File[];

    if (images.length > 0) {
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          return await uploadToCloudinary(image);
        })
      );

      await prisma.image.createMany({
        data: imageUrls.map(url => ({
          id: uuidv4(),
          url,
          vehicleId: vehicle.id,
        })),
      });
    }

    const vehicleWithDetails = await prisma.vehicle.findUnique({
      where: { id: vehicle.id },
      include: { 
        images: true,
        marketPrices: true
      }
    });

    return NextResponse.json(vehicleWithDetails, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar veículo' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        images: true,
        expenses: true,
        marketPrices: true,
        saleInfo: true,
      },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar veículos' },
      { status: 500 }
    );
  }
} 