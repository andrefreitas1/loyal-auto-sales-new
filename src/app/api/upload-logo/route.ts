import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Definir que esta rota é dinâmica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: 'Não autorizado' 
      }, { status: 401 });
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
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'loyal-auto-sales',
          public_id: 'logo',
          overwrite: true,
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
  }
} 