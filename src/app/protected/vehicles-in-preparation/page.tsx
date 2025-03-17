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
            Confira os veículos que estão sendo preparados para venda. 
            Estes veículos precisam passar por inspeção e preparação antes de serem disponibilizados para venda.
          </p>
        </div>

        {/* Grid de Veículos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/protected/vehicles/${vehicle.id}`}
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
              </div>

              {/* Informações do Veículo */}
              <div className="p-3 sm:p-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                </h2>
                <div className="space-y-3">
                  {/* Milhagem */}
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm sm:text-base">{vehicle.mileage.toLocaleString()} milhas</span>
                  </div>

                  {/* Cor */}
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span className="text-sm sm:text-base">{vehicle.color}</span>
                  </div>

                  {/* Valores */}
                  {vehicle.marketPrices && (
                    <div className="pt-4 border-t border-gray-100">
                      {/* Preço de Venda */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-grow">
                            <div className="flex items-center mb-1">
                              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-medium text-green-800">Preço de Venda</span>
                            </div>
                            <div className="text-xl font-bold text-green-700">
                              ${(vehicle.marketPrices.retail || 0).toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded-full shadow-sm">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Comissão */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-grow">
                            <div className="flex items-center mb-1">
                              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="text-sm font-medium text-blue-800">Sua Comissão</span>
                            </div>
                            <div className="text-lg font-bold text-blue-700">
                              ${(vehicle.commissionValue || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              Ganhe essa comissão ao vender este veículo!
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded-full shadow-sm">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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