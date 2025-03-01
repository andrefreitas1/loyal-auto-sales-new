'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  purchasePrice: number;
  purchaseDate: string;
  salePrice: number;
  status: string;
  images: Array<{
    id: string;
    url: string;
  }>;
}

export default function ForSaleVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const data = await response.json();
        // Filtrar apenas veículos com status 'for_sale'
        setVehicles(data.filter((v: Vehicle) => v.status === 'for_sale'));
      }
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (vehicleId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [vehicleId]: true
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Veículos à Venda</h1>
        <div className="flex gap-4">
          <Link
            href="/protected/vehicles"
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Todos os Veículos
          </Link>
          <Link
            href="/protected/vehicles/new"
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded"
          >
            Novo Veículo
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Link
            key={vehicle.id}
            href={`/protected/vehicles/${vehicle.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              {vehicle.images?.length > 0 && !imageErrors[vehicle.id] ? (
                <div className="relative w-full h-full">
                  <Image
                    src={vehicle.images[0].url}
                    alt={vehicle.model}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    onError={() => handleImageError(vehicle.id)}
                    priority
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Sem imagem</span>
                </div>
              )}
              <div className="absolute top-0 right-0 m-2">
                <span className="px-2 py-1 rounded text-sm font-semibold bg-green-500 text-white">
                  À Venda
                </span>
              </div>
            </div>

            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </h2>
              <div className="text-gray-600">
                <p>Milhas: {vehicle.mileage.toLocaleString()}</p>
                <p>Valor de Compra: ${vehicle.purchasePrice.toLocaleString()}</p>
                <p>Data de Aquisição: {new Date(vehicle.purchaseDate).toLocaleDateString('pt-BR')}</p>
                <p>Preço de Venda: ${vehicle.salePrice.toLocaleString()}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhum veículo à venda no momento.</p>
          <Link
            href="/protected/vehicles"
            className="text-primary-600 hover:text-primary-700 font-semibold mt-2 inline-block"
          >
            Ver todos os veículos
          </Link>
        </div>
      )}
    </div>
  );
} 