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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
              <Link href="/protected/vehicles-for-sale" className="hover:text-primary-600 transition-colors">
                Veículos à Venda
              </Link>
              <span>/</span>
              <span>{vehicle.brand} {vehicle.model}</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              {vehicle.brand} {vehicle.model} {vehicle.year}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna da Esquerda - Galeria */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Imagem Principal */}
                  <div 
                    className="relative aspect-[16/9] cursor-pointer"
                    onClick={() => setIsModalOpen(true)}
                  >
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <>
                        <Image
                          src={vehicle.images[currentImageIndex].url}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                          <svg className="w-12 h-12 text-white opacity-0 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Miniaturas */}
                  {vehicle.images && vehicle.images.length > 1 && (
                    <div className="p-4 border-t">
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {vehicle.images.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden ${
                              currentImageIndex === index ? 'ring-2 ring-primary-500' : ''
                            }`}
                          >
                            <Image
                              src={image.url}
                              alt={`${vehicle.brand} ${vehicle.model} - Imagem ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Descrição */}
                {vehicle.description && (
                  <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4">Descrição</h2>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {vehicle.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Coluna da Direita - Informações */}
              <div className="lg:col-span-1">
                {/* Preço */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h2 className="text-2xl font-semibold mb-4">Valor de Venda</h2>
                  <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <div className="text-4xl font-bold text-green-600">
                      {formatCurrency(vehicle.marketPrices?.retail || 0)}
                    </div>
                  </div>
                </div>

                {/* Informações do Veículo */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4">Informações do Veículo</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Marca</span>
                      <span className="font-medium">{vehicle.brand}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Modelo</span>
                      <span className="font-medium">{vehicle.model}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Ano</span>
                      <span className="font-medium">{vehicle.year}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Quilometragem</span>
                      <span className="font-medium">{vehicle.mileage.toLocaleString()} milhas</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Cor</span>
                      <span className="font-medium">{vehicle.color}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">VIN</span>
                      <span className="font-medium">{vehicle.vin}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Imagem em Tela Cheia */}
      {isModalOpen && vehicle.images && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={previousImage}
              className="absolute left-4 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="relative w-full h-full max-w-7xl mx-auto p-4">
              <Image
                src={vehicle.images[currentImageIndex].url}
                alt={`${vehicle.brand} ${vehicle.model}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            <button
              onClick={nextImage}
              className="absolute right-4 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
} 