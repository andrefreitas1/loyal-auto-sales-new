import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, vehicleId } = body;

    if (!firstName || !lastName || !email || !phone) {
      return new NextResponse('Dados inválidos', { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        status: 'pending',
        vehicleId: vehicleId || null
      }
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('[CONTACT_POST]', error);
    return new NextResponse('Erro interno', { status: 500 });
  }
} 