'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Expense {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
}

interface MarketPrice {
  wholesale: number;
  mmr: number;
  retail: number;
  repasse: number;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  purchasePrice: number;
  purchaseDate: string;
  status: string;
  images: Array<{ id: string; url: string }>;
  expenses: Expense[];
  marketPrices: MarketPrice | null;
  saleInfo: { salePrice: number; saleDate: string } | null;
  color: string;
  vin: string;
}

export default function VehicleDetails() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    type: 'maintenance',
    description: '',
    amount: 0,
  });
  const [salePrice, setSalePrice] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState<Vehicle | null>(null);
  const [expenseType, setExpenseType] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (vehicle) {
      // Reseta os erros de imagem quando o veículo muda
      setImageErrors({});
    }
  }, [vehicle]);

  useEffect(() => {
    fetchVehicleDetails();
  }, [params.id]);

  useEffect(() => {
    if (vehicle && !editedVehicle) {
      setEditedVehicle(vehicle);
    }
  }, [vehicle]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [vehicle]);

  const fetchVehicleDetails = async () => {
    try {
      const response = await fetch(`/api/vehicles/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setVehicle(data);
      } else {
        throw new Error('Veículo não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do veículo:', error);
      setError('Erro ao carregar informações do veículo');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: expenseType,
          description: expenseDescription,
          amount: expenseAmount,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar despesa');
      }

      const data = await response.json();
      setVehicle(data.vehicle);
      setExpenseType('');
      setExpenseDescription('');
      setExpenseAmount(0);
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      alert('Erro ao adicionar despesa. Tente novamente.');
    }
  };

  const handleSellVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/vehicles/${params.id}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ salePrice }),
      });

      if (response.ok) {
        fetchVehicleDetails();
      }
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/vehicles/${params.id}/expenses?expenseId=${expenseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchVehicleDetails();
      } else {
        alert('Erro ao excluir despesa. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      alert('Erro ao excluir despesa. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageError = (imageId: string) => {
    console.error(`Erro ao carregar imagem ${imageId}`);
    setImageErrors(prev => ({
      ...prev,
      [imageId]: true
    }));
  };

  const nextImage = () => {
    if (vehicle?.images && vehicle.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
    }
  };

  const previousImage = () => {
    if (vehicle?.images && vehicle.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
    }
  };

  const handleSaveChanges = async () => {
    if (!editedVehicle) return;

    try {
      const response = await fetch(`/api/vehicles/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand: editedVehicle.brand,
          model: editedVehicle.model,
          year: editedVehicle.year,
          mileage: editedVehicle.mileage,
          purchasePrice: editedVehicle.purchasePrice,
          purchaseDate: editedVehicle.purchaseDate,
          marketPrices: editedVehicle.marketPrices,
          color: editedVehicle.color,
          vin: editedVehicle.vin
        }),
      });

      if (response.ok) {
        const updatedVehicle = await response.json();
        setVehicle(updatedVehicle);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!confirm('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/vehicles/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/protected/vehicles');
      } else {
        alert('Erro ao excluir veículo. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      alert('Erro ao excluir veículo. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/vehicles/${params.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchVehicleDetails();
      } else {
        alert('Erro ao atualizar status do veículo. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do veículo. Tente novamente.');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'acquired':
        return 'bg-yellow-500';
      case 'in_preparation':
        return 'bg-blue-500';
      case 'for_sale':
        return 'bg-green-500';
      case 'sold':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Criar FormData para upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload para o Cloudinary
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const { url } = await uploadResponse.json();

      // Adicionar imagem ao veículo
      const response = await fetch(`/api/vehicles/${params.id}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (response.ok) {
        fetchVehicleDetails();
      } else {
        throw new Error('Erro ao adicionar imagem');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${params.id}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchVehicleDetails();
      } else {
        throw new Error('Erro ao excluir imagem');
      }
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      alert('Erro ao excluir imagem');
    }
  };

  const handleDownloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `veiculo_${vehicle?.brand}_${vehicle?.model}_${new Date().getTime()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
      alert('Erro ao baixar imagem');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              {error || 'Veículo não encontrado'}
            </h1>
            <Link
              href="/protected/vehicles"
              className="text-primary-600 hover:text-primary-700"
            >
              Voltar para lista de veículos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalExpenses = vehicle.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                <Link href="/protected/vehicles" className="hover:text-primary-600 transition-colors">
                  Veículos
                </Link>
                <span>/</span>
                <span>{vehicle.brand} {vehicle.model}</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </h1>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(vehicle.status)}`}>
                  {getStatusText(vehicle.status)}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">VIN: {vehicle.vin}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {vehicle.status === 'acquired' && (
                <button
                  onClick={() => handleStatusChange('in_preparation')}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Mover para Preparação
                </button>
              )}
              
              {vehicle.status === 'in_preparation' && (
                <button
                  onClick={() => handleStatusChange('for_sale')}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Disponibilizar para Venda
                </button>
              )}
              
              <button
                onClick={handleDeleteVehicle}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeleting ? 'Excluindo...' : 'Excluir Veículo'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="flex justify-between items-center p-6">
                  <h2 className="text-xl font-semibold text-gray-900">Imagens do Veículo</h2>
                  {session?.user?.role === 'admin' && (
                    <div>
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      <label
                        htmlFor="imageUpload"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                      >
                        {uploading ? 'Enviando...' : 'Adicionar Imagem'}
                      </label>
                    </div>
                  )}
                </div>

                {/* Imagem Principal */}
                <div className="relative aspect-[16/9] w-full">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <>
                      <Image
                        src={vehicle.images[currentImageIndex].url}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                      />
                      {/* Botões de navegação */}
                      {vehicle.images.length > 1 && (
                        <>
                          <button
                            onClick={previousImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-opacity"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-opacity"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            sizes="80px"
                          />
                          {session?.user?.role === 'admin' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(image.id);
                              }}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Despesas</h2>
                {vehicle.expenses.length > 0 ? (
                  <div className="space-y-4">
                    {vehicle.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(expense.date).toLocaleDateString('pt-BR')} • {expense.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">
                            ${expense.amount.toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">Total de Despesas</span>
                        <span className="text-lg font-semibold text-gray-900">
                          ${totalExpenses.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Nenhuma despesa registrada.</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Preços de Mercado</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Editar
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vehicle.marketPrices && !isEditing && (
                    <>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">Retail</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          ${vehicle.marketPrices.retail.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </dd>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">MMR</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          ${vehicle.marketPrices.mmr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </dd>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">Repasse</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          ${vehicle.marketPrices.repasse.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </dd>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">Wholesale</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                          ${vehicle.marketPrices.wholesale.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </dd>
                      </div>
                    </>
                  )}
                  {vehicle.marketPrices && isEditing && (
                    <>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">Retail</dt>
                        <input
                          type="number"
                          value={editedVehicle?.marketPrices?.retail || 0}
                          onChange={(e) => setEditedVehicle(prev => ({
                            ...prev!,
                            marketPrices: {
                              ...prev!.marketPrices!,
                              retail: parseFloat(e.target.value)
                            }
                          }))}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">MMR</dt>
                        <input
                          type="number"
                          value={editedVehicle?.marketPrices?.mmr || 0}
                          onChange={(e) => setEditedVehicle(prev => ({
                            ...prev!,
                            marketPrices: {
                              ...prev!.marketPrices!,
                              mmr: parseFloat(e.target.value)
                            }
                          }))}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">Repasse</dt>
                        <input
                          type="number"
                          value={editedVehicle?.marketPrices?.repasse || 0}
                          onChange={(e) => setEditedVehicle(prev => ({
                            ...prev!,
                            marketPrices: {
                              ...prev!.marketPrices!,
                              repasse: parseFloat(e.target.value)
                            }
                          }))}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">Wholesale</dt>
                        <input
                          type="number"
                          value={editedVehicle?.marketPrices?.wholesale || 0}
                          onChange={(e) => setEditedVehicle(prev => ({
                            ...prev!,
                            marketPrices: {
                              ...prev!.marketPrices!,
                              wholesale: parseFloat(e.target.value)
                            }
                          }))}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </>
                  )}
                  {!vehicle.marketPrices && (
                    <div className="col-span-4 text-center py-4 text-gray-500">
                      Preços de mercado não definidos
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedVehicle(vehicle);
                      }}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Informações do Veículo</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Editar
                  </button>
                </div>
                <div className="space-y-4">
                  {!isEditing ? (
                    <>
                      <div className="border-b border-gray-200 pb-4">
                        <p className="text-sm text-gray-600">VIN</p>
                        <p className="font-medium text-gray-900">{vehicle.vin}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Marca</p>
                          <p className="font-medium text-gray-900">{vehicle.brand}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Modelo</p>
                          <p className="font-medium text-gray-900">{vehicle.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Ano</p>
                          <p className="font-medium text-gray-900">{vehicle.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Cor</p>
                          <p className="font-medium text-gray-900">{vehicle.color}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Milhas</p>
                          <p className="font-medium text-gray-900">{vehicle.mileage.toLocaleString()} mi</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Data de Aquisição</p>
                          <p className="font-medium text-gray-900">
                            {new Date(vehicle.purchaseDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="border-b border-gray-200 pb-4">
                        <label className="text-sm text-gray-600">VIN</label>
                        <input
                          type="text"
                          value={editedVehicle?.vin || ''}
                          onChange={(e) => setEditedVehicle(prev => ({ ...prev!, vin: e.target.value }))}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Marca</label>
                          <input
                            type="text"
                            value={editedVehicle?.brand || ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, brand: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Modelo</label>
                          <input
                            type="text"
                            value={editedVehicle?.model || ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, model: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Ano</label>
                          <input
                            type="number"
                            value={editedVehicle?.year || ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, year: parseInt(e.target.value) }))}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Cor</label>
                          <input
                            type="text"
                            value={editedVehicle?.color || ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, color: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Milhas</label>
                          <input
                            type="number"
                            value={editedVehicle?.mileage || ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, mileage: parseFloat(e.target.value) }))}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Data de Aquisição</label>
                          <input
                            type="date"
                            value={editedVehicle?.purchaseDate ? new Date(editedVehicle.purchaseDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, purchaseDate: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    {!isEditing ? (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Valor de Compra</p>
                          <p className="font-medium text-gray-900">
                            ${vehicle.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        {vehicle.status === 'for_sale' && vehicle.saleInfo && (
                          <div>
                            <p className="text-sm text-gray-600">Preço de Venda</p>
                            <p className="font-medium text-gray-900">
                              ${vehicle.saleInfo.salePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div>
                        <label className="text-sm text-gray-600">Valor de Compra</label>
                        <input
                          type="number"
                          value={editedVehicle?.purchasePrice || ''}
                          onChange={(e) => setEditedVehicle(prev => ({ ...prev!, purchasePrice: parseFloat(e.target.value) }))}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Adicionar Despesa</h2>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Despesa
                    </label>
                    <select
                      value={expenseType}
                      onChange={(e) => setExpenseType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Selecione um tipo</option>
                      <option value="maintenance">Manutenção</option>
                      <option value="fuel">Combustível</option>
                      <option value="washing">Lavagem</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Adicionar Despesa
                  </button>
                </form>
              </div>

              {vehicle.status === 'for_sale' && (
                <div className="bg-white rounded-xl shadow-card p-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Registrar Venda</h2>
                  <form onSubmit={handleSellVehicle} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor da Venda ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={salePrice}
                        onChange={(e) => setSalePrice(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Registrar Venda
                    </button>
                  </form>
                </div>
              )}

              {vehicle.status === 'sold' && vehicle.saleInfo && (
                <div className="bg-white rounded-xl shadow-card p-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da Venda</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Data da Venda</p>
                      <p className="font-medium text-gray-900">
                        {new Date(vehicle.saleInfo.saleDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor da Venda</p>
                      <p className="font-medium text-gray-900">
                        ${vehicle.saleInfo.salePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Lucro</span>
                        <span className={`font-medium ${
                          vehicle.saleInfo.salePrice - vehicle.purchasePrice - totalExpenses >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          ${(vehicle.saleInfo.salePrice - vehicle.purchasePrice - totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 