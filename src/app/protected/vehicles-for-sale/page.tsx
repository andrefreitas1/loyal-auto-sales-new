'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Vehicle } from '@/types/vehicle';
import { formatCurrency } from '@/utils/format';

interface VehicleWithPurchaseDate extends Vehicle {
  purchaseDate: string;
}

export default function VehiclesForSale() {
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
        const forSaleVehicles = allVehicles.filter((v: VehicleWithPurchaseDate) => v.status === 'for_sale');
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
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                </h2>
                <div className="text-sm sm:text-base text-gray-600 space-y-1">
                  <p>Milhas: {vehicle.mileage.toLocaleString()} mi</p>
                  <p>Valor de Compra: ${vehicle.purchasePrice.toLocaleString()}</p>
                  <p>Data de Aquisição: {new Date(vehicle.purchaseDate).toLocaleDateString('pt-BR')}</p>
                  {vehicle.marketPrices && (
                    <div className="space-y-1">
                      <p>Valor Retail: ${vehicle.marketPrices.retail.toLocaleString()}</p>
                      <p>Comissão: ${(vehicle.commissionValue || 0).toLocaleString()}</p>
                      <p className="font-semibold text-green-600">Valor Total: ${((vehicle.marketPrices.retail || 0) + (vehicle.commissionValue || 0)).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {vehicles.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhum veículo à venda no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
} 