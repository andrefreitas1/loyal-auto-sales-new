'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  message?: string;
}

export default function LogoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!session || !session.user || session.user.role !== 'admin') {
      setError('Você não tem permissão para fazer upload da logo');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message || 'Logo atualizada com sucesso!');
        // Atualizar a página para mostrar a nova logo
        router.refresh();
      } else {
        setError(data.error || 'Erro ao fazer upload da logo');
      }
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao fazer upload da logo');
    } finally {
      setIsUploading(false);
    }
  };

  if (!session || !session.user || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label
          htmlFor="logo-upload"
          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
        >
          <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            {isUploading ? 'Enviando...' : 'Escolher nova logo'}
          </span>
          <input
            id="logo-upload"
            name="logo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 