import cloudinary from '../lib/cloudinary';
import fs from 'fs';
import path from 'path';

interface CloudinaryResponse {
  secure_url: string;
  [key: string]: any;
}

async function uploadLogo() {
  try {
    const logoPath = 'C:/Users/mls_p/OneDrive/Área de Trabalho/Imagens para subir no cloudnary/logo-preta.png';
    
    // Fazer o upload para o Cloudinary
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

      // Ler o arquivo e enviar para o stream de upload
      fs.createReadStream(logoPath).pipe(uploadStream);
    });

    console.log('Logo enviada com sucesso:', result);
    return result.secure_url;
  } catch (error) {
    console.error('Erro ao fazer upload da logo:', error);
    throw error;
  }
}

uploadLogo()
  .then(url => {
    console.log('URL da logo:', url);
  })
  .catch(error => {
    console.error('Erro:', error);
    process.exit(1);
  }); 