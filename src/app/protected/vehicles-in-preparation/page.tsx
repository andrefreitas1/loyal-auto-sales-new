'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Vehicle } from '@/types/vehicle';
import { formatCurrency } from '@/utils/format';

interface VehicleWithPurchaseDate extends Vehicle {
  purchaseDate: string;
}

export default function VehiclesInPreparation() {
  const [vehicles, setVehicles] = useState<VehicleWithPurchaseDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const allVehicles = await response.json();
        const inPreparationVehicles = allVehicles.filter((v: VehicleWithPurchaseDate) => v.status === 'in_preparation');
        setVehicles(inPreparationVehicles);
      }
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Veículos em Preparação
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Veículos que estão passando por preparação para venda. 
            Em breve estarão disponíveis para compra.
          </p>
        </div>

        {/* Grid de Veículos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/protected/vehicles-in-preparation/${vehicle.id}`}
              className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Imagem do Veículo */}
              <div className="relative aspect-[4/3]">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <Image
                    src={vehicle.images[0].url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sem imagem</span>
                  </div>
                )}
                {/* Badge de Status */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Em Preparação
                  </span>
                </div>
              </div>

              {/* Informações do Veículo */}
              <div className="p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                </h2>
                <div className="space-y-3">
                  {/* Milhagem */}
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm sm:text-base">{vehicle.mileage.toLocaleString()} km</span>
                  </div>

                  {/* Cor */}
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span className="text-sm sm:text-base">{vehicle.color}</span>
                  </div>

                  {/* Data de Aquisição */}
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm sm:text-base">
                      {new Date(vehicle.purchaseDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {/* Mensagem de Status */}
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">
                      Veículo em preparação para venda
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {vehicles.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhum veículo em preparação no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
} 