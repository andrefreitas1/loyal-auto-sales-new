require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configurar o Cloudinary
cloudinary.config({
  cloud_name: "ds6tkgdjg",
  api_key: "779263986696692",
  api_secret: "_NUUxKixPL-9oZzR9czdA7yPKJg"
});

async function uploadLogo() {
  try {
    const logoPath = 'C:/Users/mls_p/OneDrive/Área de Trabalho/Imagens para subir no cloudnary/logo-preta.png';
    
    // Fazer o upload para o Cloudinary
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