'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Vehicle } from '@/types/vehicle';
import { formatCurrency } from '@/utils/format';

export default function VehicleForSaleDetails() {
  const params = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchVehicle();
    }
  }, [params.id]);

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status !== 'for_sale') {
          router.push('/protected/vehicles-for-sale');
          return;
        }
        setVehicle(data);
      }
    } catch (error) {
      console.error('Erro ao buscar veículo:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (vehicle?.images) {
      setCurrentImageIndex((prev) =>
        prev === vehicle.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousImage = () => {
    if (vehicle?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? vehicle.images.length - 1 : prev - 1
      );
    }
  };

  if (loading || !vehicle) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
            <Link href="/protected/vehicles-for-sale" className="hover:text-primary-600 transition-colors">
              Veículos à Venda
            </Link>
            <span>/</span>
            <span>{vehicle.brand} {vehicle.model}</span>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Galeria de Imagens */}
            <div className="relative h-96">
              {vehicle.images && vehicle.images.length > 0 ? (
                <>
                  <Image
                    src={vehicle.images[currentImageIndex].url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    fill
                    className="object-cover"
                  />
                  {vehicle.images.length > 1 && (
                    <>
                      <button
                        onClick={previousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Informações do Veículo */}
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Informações do Veículo</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Ano:</span>
                      <span className="ml-2 font-medium">{vehicle.year}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quilometragem:</span>
                      <span className="ml-2 font-medium">{vehicle.mileage.toLocaleString()} milhas</span>
                    </div>
                    <div>
                      <span className="text-gray-600">VIN:</span>
                      <span className="ml-2 font-medium">{vehicle.vin}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cor:</span>
                      <span className="ml-2 font-medium">{vehicle.color}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Valor Sugerido de Venda</h2>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {formatCurrency(vehicle.marketPrices?.retail || 0)}
                    </div>
                    <p className="text-green-700">
                      Valor baseado no preço de mercado (Retail)
                    </p>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              {vehicle.description && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Descrição</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{vehicle.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 