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
  salePrice: number;
  status: string;
  images: Array<{
    id: string;
    url: string;
  }>;
  saleInfo?: {
    salePrice: number;
    saleDate: string;
  } | null;
}

export default function VehicleList() {
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
        setVehicles(data);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'acquired':
        return 'bg-yellow-500';
      case 'in_preparation':
        return 'bg-blue-500';
      case 'for_sale':
        return 'bg-green-500';
      case 'sold':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'acquired':
        return 'Adquirido';
      case 'in_preparation':
        return 'Em Preparação';
      case 'for_sale':
        return 'À Venda';
      case 'sold':
        return 'Vendido';
      default:
        return status;
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Estoque de Veículos</h1>
              <p className="text-gray-600 mt-2">Gerencie seu inventário de veículos</p>
            </div>
            <Link
              href="/protected/vehicles/new"
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Veículo
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/protected/vehicles/acquired"
              className="flex items-center bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-all group"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg group-hover:scale-105 transition-transform">Adquiridos</h3>
                <p className="text-yellow-100 text-2xl font-bold mt-1">
                  {vehicles.filter(v => v.status === 'acquired').length}
                </p>
              </div>
              <div className="text-yellow-200">
                <svg className="w-12 h-12 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </Link>

            <Link
              href="/protected/vehicles/in-preparation"
              className="flex items-center bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-all group"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg group-hover:scale-105 transition-transform">Em Preparação</h3>
                <p className="text-blue-100 text-2xl font-bold mt-1">
                  {vehicles.filter(v => v.status === 'in_preparation').length}
                </p>
              </div>
              <div className="text-blue-200">
                <svg className="w-12 h-12 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </Link>

            <Link
              href="/protected/vehicles/for-sale"
              className="flex items-center bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-all group"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg group-hover:scale-105 transition-transform">À Venda</h3>
                <p className="text-green-100 text-2xl font-bold mt-1">
                  {vehicles.filter(v => v.status === 'for_sale').length}
                </p>
              </div>
              <div className="text-green-200">
                <svg className="w-12 h-12 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </Link>

            <Link
              href="/protected/vehicles/sold"
              className="flex items-center bg-gradient-to-br from-gray-500 to-gray-600 p-6 rounded-xl shadow-md hover:shadow-lg transition-all group"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg group-hover:scale-105 transition-transform">Vendidos</h3>
                <p className="text-gray-100 text-2xl font-bold mt-1">
                  {vehicles.filter(v => v.status === 'sold').length}
                </p>
              </div>
              <div className="text-gray-200">
                <svg className="w-12 h-12 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/protected/vehicles/${vehicle.id}`}
                className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
              >
                <div className="relative h-48">
                  {vehicle.images?.length > 0 && !imageErrors[vehicle.id] ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={vehicle.images[0].url}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        onError={() => handleImageError(vehicle.id)}
                        priority
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 m-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {vehicle.brand} {vehicle.model}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">{vehicle.year}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{vehicle.mileage.toLocaleString()} mi</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {vehicle.status === 'sold' ? (
                        <span>Valor da Venda: ${vehicle.saleInfo?.salePrice.toLocaleString()}</span>
                      ) : (
                        <span>Valor de Compra: ${vehicle.purchasePrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {vehicles.length === 0 && (
            <div className="text-center py-16">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum veículo cadastrado</h3>
              <p className="text-gray-500 mb-4">Comece adicionando seu primeiro veículo ao estoque.</p>
              <Link
                href="/protected/vehicles/new"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Veículo
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 