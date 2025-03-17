'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Vehicle } from '@/types/vehicle';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  TruckIcon, 
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function VehicleInPreparationDetails() {
  const params = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/vehicles/${params.id}`);
        if (!response.ok) {
          throw new Error('Veículo não encontrado');
        }
        const data = await response.json();
        setVehicle(data);
      } catch (err) {
        setError('Erro ao carregar veículo');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [params.id]);

  const handleDownloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `veiculo-${vehicle?.brand}-${vehicle?.model}-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || 'Veículo não encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Botão Voltar */}
      <Link
        href="/protected/vehicles-in-preparation"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Voltar para Lista
      </Link>

      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-gray-600">VIN: {vehicle.vin}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
              Em Preparação
            </span>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna da Esquerda - Informações do Veículo */}
        <div className="space-y-6">
          {/* Informações do Veículo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Veículo</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">Marca:</span>
                <span className="ml-2 font-medium">{vehicle.brand}</span>
              </div>
              <div>
                <span className="text-gray-600">Modelo:</span>
                <span className="ml-2 font-medium">{vehicle.model}</span>
              </div>
              <div>
                <span className="text-gray-600">Ano:</span>
                <span className="ml-2 font-medium">{vehicle.year}</span>
              </div>
              <div>
                <span className="text-gray-600">Milhagem:</span>
                <span className="ml-2 font-medium">{vehicle.mileage.toLocaleString()} km</span>
              </div>
              <div>
                <span className="text-gray-600">Cor:</span>
                <span className="ml-2 font-medium">{vehicle.color}</span>
              </div>
              <div>
                <span className="text-gray-600">VIN:</span>
                <span className="ml-2 font-medium">{vehicle.vin}</span>
              </div>
            </div>
          </div>

          {/* Descrição */}
          {vehicle.description && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Descrição do Veículo</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{vehicle.description}</p>
            </div>
          )}
        </div>

        {/* Coluna da Direita - Imagens */}
        <div className="space-y-6">
          {/* Imagens */}
          {vehicle.images && vehicle.images.length > 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Imagens do Veículo</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicle.images.map((image, index) => (
                  <div key={image.id} className="relative aspect-square group">
                    <Image
                      src={image.url}
                      alt={`Foto ${index + 1} do veículo`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleDownloadImage(image.url, index)}
                      className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Imagens do Veículo</h2>
              <div className="text-center text-gray-500 py-8">
                Nenhuma imagem disponível
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 