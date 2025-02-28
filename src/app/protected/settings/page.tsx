'use client';

import LogoUpload from '@/app/components/LogoUpload';

export default function Settings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Configurações</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Logo do Sistema</h2>
          <p className="text-sm text-gray-500 mb-4">
            Atualize a logo que aparece no cabeçalho e na página de login.
            Recomendamos usar uma imagem PNG com fundo transparente.
          </p>
          <LogoUpload />
        </div>
      </div>
    </div>
  );
} 