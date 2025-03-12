'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

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

  useEffect(() => {
    fetchVehicleDetails();
  }, [params.id]);

  useEffect(() => {
    if (vehicle && !editedVehicle) {
      setEditedVehicle(vehicle);
    }
  }, [vehicle]);

  const fetchVehicleDetails = async () => {
    try {
      const response = await fetch(`/api/vehicles/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setVehicle(data);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do veículo:', error);
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
          marketPrices: editedVehicle.marketPrices
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Veículo não encontrado.</p>
      </div>
    );
  }

  const totalExpenses = vehicle.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : vehicle ? (
          <div className="space-y-8">
            {/* Cabeçalho */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {vehicle.brand} {vehicle.model} {vehicle.year}
                </h1>
                <p className="mt-1 text-sm text-gray-500">VIN: {vehicle.vin}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
                <button
                  onClick={handleDeleteVehicle}
                  disabled={isDeleting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Coluna da esquerda - Imagens e informações básicas */}
              <div className="space-y-6">
                {/* Carrossel de imagens */}
                <div className="relative aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
                  {vehicle.images && vehicle.images.length > 0 && !imageErrors[vehicle.images[currentImageIndex].id] ? (
                    <>
                      <Image
                        src={vehicle.images[currentImageIndex].url}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(vehicle.images[currentImageIndex].id)}
                      />
                      {vehicle.images.length > 1 && (
                        <>
                          <button
                            onClick={previousImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                          >
                            ←
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                          >
                            →
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Informações básicas */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Veículo</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Quilometragem</p>
                      <p className="mt-1 text-sm text-gray-900">{vehicle.mileage.toLocaleString()} mi</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cor</p>
                      <p className="mt-1 text-sm text-gray-900">{vehicle.color}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className={`mt-1 text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                        {getStatusText(vehicle.status)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Valor de Venda em Destaque */}
                {vehicle.marketPrices && (
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg rounded-lg p-8 text-white">
                    <h2 className="text-2xl font-bold mb-2">Valor de Venda</h2>
                    <div className="text-4xl font-bold">
                      ${vehicle.marketPrices.retail.toLocaleString()}
                    </div>
                    <p className="text-primary-100 mt-2">Preço sugerido para venda ao cliente final</p>
                  </div>
                )}
              </div>

              {/* Coluna da direita - Preços e status */}
              <div className="space-y-6">
                {/* Market Prices */}
                {vehicle.marketPrices && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Preços de Mercado</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">MMR (Manheim Market Report)</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          ${vehicle.marketPrices.mmr.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Wholesale (Preço de Atacado)</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          ${vehicle.marketPrices.wholesale.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Repasse</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          ${vehicle.marketPrices.repasse.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Actions */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Alterar Status</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleStatusChange('in_preparation')}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      Em Preparação
                    </button>
                    <button
                      onClick={() => handleStatusChange('for_sale')}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                    >
                      À Venda
                    </button>
                  </div>
                </div>

                {/* Vender Veículo */}
                {vehicle.status === 'for_sale' && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Registrar Venda</h2>
                    <form onSubmit={handleSellVehicle} className="space-y-4">
                      <div>
                        <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700">
                          Valor da Venda
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="salePrice"
                            id="salePrice"
                            value={salePrice}
                            onChange={(e) => setSalePrice(Number(e.target.value))}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Registrar Venda
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500">Veículo não encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
} 