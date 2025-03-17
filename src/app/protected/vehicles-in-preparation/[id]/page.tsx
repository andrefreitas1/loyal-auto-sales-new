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
  CheckCircleIcon
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
            <p className="text-gray-600">Placa: {vehicle.vin}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
              Em Preparação
            </span>
          </div>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Veículo</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Ano:</span>
              <span className="ml-2 font-medium">{vehicle.year}</span>
            </div>
            <div>
              <span className="text-gray-600">Cor:</span>
              <span className="ml-2 font-medium">{vehicle.color}</span>
            </div>
            <div>
              <span className="text-gray-600">Quilometragem:</span>
              <span className="ml-2 font-medium">{vehicle.mileage.toLocaleString()} km</span>
            </div>
            <div>
              <span className="text-gray-600">VIN:</span>
              <span className="ml-2 font-medium">{vehicle.vin}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Financeiras</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Valor de Compra:</span>
              <span className="ml-2 font-medium">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'USD'
                }).format(vehicle.purchasePrice)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Valor de Venda:</span>
              <span className="ml-2 font-medium">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'USD'
                }).format(vehicle.retailPrice || 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Comissão:</span>
              <span className="ml-2 font-medium">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'USD'
                }).format(vehicle.commissionValue || 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Lucro:</span>
              <span className="ml-2 font-medium">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'USD'
                }).format((vehicle.retailPrice || 0) - vehicle.purchasePrice - (vehicle.commissionValue || 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Descrição */}
      {vehicle.description && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Descrição</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{vehicle.description}</p>
        </div>
      )}

      {/* Fotos */}
      {vehicle.images && vehicle.images.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fotos do Veículo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {vehicle.images.map((image) => (
              <div key={image.id} className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={`Foto do veículo`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 