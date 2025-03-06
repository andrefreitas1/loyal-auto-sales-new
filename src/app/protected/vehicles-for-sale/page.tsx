'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Vehicle } from '@/types/vehicle';
import { formatCurrency } from '@/utils/format';

export default function VehiclesForSale() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const allVehicles = await response.json();
        const forSaleVehicles = allVehicles.filter((v: Vehicle) => v.status === 'for_sale');
        setVehicles(forSaleVehicles);
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
            Veículos Disponíveis para Venda
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Confira nossa seleção de veículos premium disponíveis para venda. 
            Cada veículo passa por uma rigorosa inspeção de qualidade.
          </p>
        </div>

        {/* Grid de Veículos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/protected/vehicles-for-sale/${vehicle.id}`}
              className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Imagem do Veículo */}
              <div className="relative aspect-[16/10] overflow-hidden">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <Image
                    src={vehicle.images[0].url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Badge de Destaque */}
                <div className="absolute top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Disponível
                  </span>
                </div>
              </div>

              {/* Informações do Veículo */}
              <div className="p-6">
                {/* Título e Ano */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {vehicle.brand} {vehicle.model}
                  </h2>
                  <span className="text-lg font-semibold text-gray-700">
                    {vehicle.year}
                  </span>
                </div>

                {/* Especificações */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{vehicle.mileage.toLocaleString()} milhas</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span>{vehicle.color}</span>
                  </div>
                </div>

                {/* Preço e CTA */}
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {formatCurrency(vehicle.marketPrices?.retail || 0)}
                  </div>
                  <span className="text-primary-600 font-medium group-hover:underline">
                    Ver detalhes →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mensagem se não houver veículos */}
        {vehicles.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600">
              Nenhum veículo disponível para venda no momento
            </h2>
            <p className="text-gray-500 mt-2">
              Por favor, volte mais tarde para verificar novos veículos
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 