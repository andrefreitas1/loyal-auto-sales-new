import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import fs from 'fs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: 'Não autorizado' 
      }, { status: 401 });
    }

    const logoPath = 'C:\\Users\\mls_p\\OneDrive\\Documentos\\uploadcloudnary\\logo-preta.png';
    
    if (!fs.existsSync(logoPath)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Arquivo não encontrado' 
      }, { status: 404 });
    }

    // Fazer o upload para o Cloudinary
    const result = await cloudinary.uploader.upload(logoPath, {
      folder: 'loyal-auto-sales',
      public_id: 'logo',
      overwrite: true,
      resource_type: 'image'
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