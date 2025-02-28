import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Definir que esta rota é dinâmica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CloudinaryResponse {
  secure_url: string;
  [key: string]: any;
}

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verificar o token JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token não fornecido' 
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decodedToken: JwtPayload;

    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token inválido' 
      }, { status: 401 });
    }

    // Verificar se o usuário é admin
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Acesso não autorizado' 
      }, { status: 403 });
    }

    // Obter o arquivo do formulário
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nenhum arquivo enviado' 
      }, { status: 400 });
    }

    // Converter o arquivo para um buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Fazer o upload para o Cloudinary usando stream
    const result = await new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'loyal-auto-sales',
          public_id: 'logo',
          overwrite: true,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryResponse);
        }
      );

      // Enviar o buffer para o stream de upload
      const bufferStream = require('stream').Readable.from(buffer);
      bufferStream.pipe(uploadStream);
    });

    console.log('Upload bem sucedido:', result);

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url,
      message: 'Logo enviada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao fazer upload da logo:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao fazer upload da logo',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 