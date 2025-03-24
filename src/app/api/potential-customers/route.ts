import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return new NextResponse('Acesso negado', { status: 403 });
    }

    const contacts = await prisma.contact.findMany({
      include: {
        vehicle: {
          select: {
            brand: true,
            model: true,
            year: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Mapear os contatos para o formato esperado pelo frontend
    const mappedContacts = contacts.map(contact => ({
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      createdAt: contact.createdAt,
      isRead: contact.status === 'read',
      vehicle: contact.vehicle
    }));

    return NextResponse.json(mappedContacts);
  } catch (error) {
    console.error('[CONTACTS_GET]', error);
    return new NextResponse('Erro interno', { status: 500 });
  }
} 