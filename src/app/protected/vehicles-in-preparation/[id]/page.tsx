'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Vehicle } from '@/types/vehicle';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  TruckIcon, 
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function VehicleInPreparationDetails() {
  const params = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedImagesForDownload, setSelectedImagesForDownload] = useState<string[]>([]);

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
        if (data.status !== 'in_preparation') {
          router.push('/protected/vehicles-in-preparation');
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

  const handleDownloadSelectedImages = async () => {
    try {
      for (const imageId of selectedImagesForDownload) {
        const image = vehicle?.images.find(img => img.id === imageId);
        if (image) {
          const response = await fetch(image.url);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `veiculo_${vehicle?.brand}_${vehicle?.model}_${imageId}.jpg`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
      setShowDownloadModal(false);
      setSelectedImagesForDownload([]);
    } catch (error) {
      console.error('Erro ao baixar imagens:', error);
      alert('Erro ao baixar imagens. Tente novamente.');
    }
  };

  const toggleImageDownloadSelection = (imageId: string) => {
    setSelectedImagesForDownload(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId);
      } else {
        return [...prev, imageId];
      }
    });
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
              <Link href="/protected/vehicles-in-preparation" className="hover:text-primary-600 transition-colors">
                Veículos em Preparação
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

                  {/* Grid de Imagens */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {vehicle.images.map((image) => (
                        <div
                          key={image.id}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                            selectedImagesForDownload.includes(image.id)
                              ? 'ring-2 ring-blue-500'
                              : ''
                          }`}
                          onClick={() => toggleImageDownloadSelection(image.id)}
                        >
                          <Image
                            src={image.url}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                          <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity ${
                            selectedImagesForDownload.includes(image.id)
                              ? 'opacity-100'
                              : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <svg
                              className={`w-8 h-8 ${
                                selectedImagesForDownload.includes(image.id)
                                  ? 'text-blue-500'
                                  : 'text-white'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {selectedImagesForDownload.includes(image.id) ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              )}
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna da Direita - Informações */}
              <div className="space-y-6">
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
                      <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
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

                {/* Descrição */}
                {vehicle.description && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4">Descrição do Veículo</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{vehicle.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Download */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Baixar Imagens Selecionadas</h3>
            <p className="text-gray-600 mb-6">
              {selectedImagesForDownload.length} imagem(ns) selecionada(s)
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDownloadSelectedImages}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Baixar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 