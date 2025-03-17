'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface Expense {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  receipts: {
    id: string;
    url: string;
  }[];
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
  commissionValue: number;
  purchaseDate: string;
  status: string;
  images: Array<{ id: string; url: string }>;
  expenses: Expense[];
  marketPrices: MarketPrice | null;
  saleInfo: { salePrice: number; saleDate: string } | null;
  color: string;
  vin: string;
  description?: string;
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
  const [hasCommission, setHasCommission] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedVehicle, setEditedVehicle] = useState<Vehicle | null>(null);
  const [expenseType, setExpenseType] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedImagesForDeletion, setSelectedImagesForDeletion] = useState<string[]>([]);
  const [selectedImagesForDownload, setSelectedImagesForDownload] = useState<string[]>([]);

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

    if (!expenseType || !expenseDescription || expenseAmount <= 0) {
      setError('Preencha todos os campos da despesa');
      return;
    }

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
      toast.success('Despesa adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      setError('Erro ao adicionar despesa');
      toast.error('Erro ao adicionar despesa');
    }
  };

  const handleReceiptUpload = async (expenseId: string, files: FileList) => {
    if (!files || files.length === 0) return;

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/expenses/${expenseId}/receipts`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload dos comprovantes');
      }

      const { receipts } = await response.json();
      
      setVehicle((prev) => ({
        ...prev!,
        expenses: prev!.expenses.map((expense) =>
          expense.id === expenseId
            ? { ...expense, receipts: [...expense.receipts, ...receipts] }
            : expense
        ),
      }));

      toast.success('Comprovantes adicionados com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload dos comprovantes:', error);
      toast.error('Erro ao fazer upload dos comprovantes');
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
        body: JSON.stringify({ 
          salePrice,
          hasCommission,
          commissionValue: vehicle?.commissionValue || 0
        }),
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSaveChanges = async () => {
    if (!editedVehicle) return;

    try {
      // Converter a data do formato americano para ISO se necessário
      let purchaseDate = editedVehicle.purchaseDate;
      if (purchaseDate.includes('/')) {
        const [month, day, year] = purchaseDate.split('/');
        purchaseDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

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
          commissionValue: editedVehicle.commissionValue,
          purchaseDate: purchaseDate,
          marketPrices: editedVehicle.marketPrices,
          color: editedVehicle.color,
          vin: editedVehicle.vin,
          description: editedVehicle.description
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
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(e.target.files).forEach((file) => {
        formData.append('files', file);
      });

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Erro ao fazer upload das imagens');
      }

      const { urls } = await uploadResponse.json();

      // Atualizar o veículo com as novas imagens
      const response = await fetch(`/api/vehicles/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedVehicle,
          images: urls,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar o veículo');
      }

      const updatedVehicle = await response.json();
      setVehicle(updatedVehicle);
      setEditedVehicle(updatedVehicle);
      toast.success('Imagens adicionadas com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setError('Erro ao fazer upload das imagens');
      toast.error('Erro ao fazer upload das imagens');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSelectedImages = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedImagesForDeletion.length} imagem(ns)?`)) {
      return;
    }

    try {
      const deletePromises = selectedImagesForDeletion.map(imageId =>
        fetch(`/api/vehicles/${params.id}/images?imageId=${imageId}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);
      fetchVehicleDetails();
      setShowDeleteModal(false);
      setSelectedImagesForDeletion([]);
    } catch (error) {
      console.error('Erro ao excluir imagens:', error);
      alert('Erro ao excluir imagens. Tente novamente.');
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImagesForDeletion(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId);
      } else {
        return [...prev, imageId];
      }
    });
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 mb-4 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                <Link href="/protected/vehicles" className="hover:text-primary-600 transition-colors">
                  Veículos
                </Link>
                <span>/</span>
                <span className="truncate">{vehicle.brand} {vehicle.model}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-white ${getStatusColor(vehicle.status)}`}>
                  {getStatusText(vehicle.status)}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-xs sm:text-sm text-gray-600">VIN: {vehicle.vin}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {vehicle.status === 'acquired' && (
                <button
                  onClick={() => handleStatusChange('in_preparation')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="sm:inline">Mover para Preparação</span>
                </button>
              )}
              
              {vehicle.status === 'in_preparation' && (
                <button
                  onClick={() => handleStatusChange('for_sale')}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="sm:inline">Disponibilizar para Venda</span>
                </button>
              )}
              
              <button
                onClick={handleDeleteVehicle}
                disabled={isDeleting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="sm:inline">{isDeleting ? 'Excluindo...' : 'Excluir'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Imagens do Veículo</h2>
                  <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      multiple
                      id="imageUpload"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                    >
                      {uploading ? 'Enviando...' : 'Adicionar Imagem'}
                    </label>
                    <button
                      onClick={() => setShowDownloadModal(true)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Baixar Imagens
                    </button>
                    {session?.user?.role === 'admin' && (
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Excluir Imagens
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full">
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
                      {vehicle.images.length > 1 && (
                        <>
                          <button
                            onClick={previousImage}
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-opacity"
                          >
                            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-opacity"
                          >
                            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {vehicle.images && vehicle.images.length > 1 && (
                  <div className="p-3 sm:p-4 border-t">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {vehicle.images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden group ${
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
                                toggleImageSelection(image.id);
                              }}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              <div className="bg-white rounded-xl shadow-card p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Despesas</h2>
                {vehicle.expenses.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {vehicle.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex flex-col sm:flex-row sm:items-start justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2 sm:gap-4"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{expense.description}</p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {formatDate(expense.date)} • {expense.type}
                          </p>
                          {expense.receipts && expense.receipts.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {expense.receipts.map((receipt) => (
                                <a
                                  key={receipt.id}
                                  href={receipt.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Ver comprovante
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <span className="font-medium text-gray-900 text-sm sm:text-base">
                            ${expense.amount.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer text-primary-600 hover:text-primary-700 transition-colors">
                              <input
                                type="file"
                                multiple
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => e.target.files && handleReceiptUpload(expense.id, e.target.files)}
                              />
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                            </label>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">Total de Despesas</span>
                        <span className="text-base sm:text-lg font-semibold text-gray-900">
                          ${totalExpenses.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-gray-600">Nenhuma despesa registrada.</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-card p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Preços de Mercado</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
                  >
                    Editar
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {vehicle.marketPrices && !isEditing && (
                    <>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Retail</dt>
                        <dd className="mt-1 text-base sm:text-lg font-semibold text-gray-900">
                          ${vehicle.marketPrices.retail.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </dd>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">MMR</dt>
                        <dd className="mt-1 text-base sm:text-lg font-semibold text-gray-900">
                          ${vehicle.marketPrices.mmr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </dd>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Repasse</dt>
                        <dd className="mt-1 text-base sm:text-lg font-semibold text-gray-900">
                          ${vehicle.marketPrices.repasse.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </dd>
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Wholesale</dt>
                        <dd className="mt-1 text-base sm:text-lg font-semibold text-gray-900">
                          ${vehicle.marketPrices.wholesale.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </dd>
                      </div>
                    </>
                  )}
                  {vehicle.marketPrices && isEditing && (
                    <>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Retail</dt>
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
                          className="mt-1 w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">MMR</dt>
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
                          className="mt-1 w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Repasse</dt>
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
                          className="mt-1 w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <dt className="text-xs sm:text-sm font-medium text-gray-500">Wholesale</dt>
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
                          className="mt-1 w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl shadow-card p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Informações do Veículo</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
                  >
                    Editar
                  </button>
                </div>
                <div className="space-y-4">
                  {!isEditing ? (
                    <>
                      <div className="border-b border-gray-200 pb-4">
                        <p className="text-xs sm:text-sm text-gray-600">VIN</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{vehicle.vin}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Marca</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{vehicle.brand}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Modelo</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{vehicle.model}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Ano</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{vehicle.year}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Cor</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{vehicle.color}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Milhas</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{vehicle.mileage.toLocaleString()} mi</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Data de Aquisição</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            {formatDate(vehicle.purchaseDate)}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="border-b border-gray-200 pb-4">
                        <label className="text-xs sm:text-sm text-gray-600">VIN</label>
                        <input
                          type="text"
                          value={editedVehicle?.vin || ''}
                          onChange={(e) => setEditedVehicle(prev => ({ ...prev!, vin: e.target.value }))}
                          className="mt-1 w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="text-xs sm:text-sm text-gray-600">Marca</label>
                          <input
                            type="text"
                            value={editedVehicle?.brand || ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, brand: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm text-gray-600">Modelo</label>
                          <input
                            type="text"
                            value={editedVehicle?.model || ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, model: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm text-gray-600">Ano</label>
                          <input
                            type="number"
                            value={editedVehicle?.year || ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, year: parseInt(e.target.value) }))}
                            className="mt-1 w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm text-gray-600">Cor</label>
                          <input
                            type="text"
                            value={editedVehicle?.color || ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, color: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm text-gray-600">Milhas</label>
                          <input
                            type="number"
                            value={editedVehicle?.mileage || ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, mileage: parseFloat(e.target.value) }))}
                            className="mt-1 w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm text-gray-600">Data de Aquisição</label>
                          <input
                            type="date"
                            value={editedVehicle?.purchaseDate ? new Date(editedVehicle.purchaseDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, purchaseDate: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 mt-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {!isEditing ? (
                      <>
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">Valor de Compra</dt>
                          <dd className="mt-1 text-base sm:text-lg font-semibold text-gray-900">
                            ${vehicle.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </dd>
                        </div>

                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                          <dt className="text-xs sm:text-sm font-medium text-gray-500">Valor da Comissão</dt>
                          <dd className="mt-1 text-base sm:text-lg font-semibold text-gray-900">
                            ${vehicle.commissionValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </dd>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-xs sm:text-sm text-gray-600">Valor de Compra</label>
                          <input
                            type="number"
                            value={editedVehicle?.purchasePrice || ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, purchasePrice: parseFloat(e.target.value) }))}
                            className="mt-1 w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm text-gray-600">Valor da Comissão</label>
                          <input
                            type="number"
                            value={editedVehicle?.commissionValue || ''}
                            onChange={(e) => setEditedVehicle(prev => ({ ...prev!, commissionValue: parseFloat(e.target.value) }))}
                            className="mt-1 w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedVehicle(vehicle);
                      }}
                      className="px-3 sm:px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-card p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Adicionar Despesa</h2>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div>
                    <label
                      htmlFor="expenseType"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tipo
                    </label>
                    <select
                      id="expenseType"
                      value={expenseType}
                      onChange={(e) => setExpenseType(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="">Selecione um tipo</option>
                      <option value="manutencao">Manutenção</option>
                      <option value="documentacao">Documentação</option>
                      <option value="combustivel">Combustível</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="expenseDescription"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Descrição
                    </label>
                    <input
                      type="text"
                      id="expenseDescription"
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="expenseAmount"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Valor
                    </label>
                    <input
                      type="number"
                      id="expenseAmount"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(Number(e.target.value))}
                      step="0.01"
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Adicionar Despesa
                  </button>
                </form>
              </div>

              {vehicle.status === 'for_sale' && (
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Registrar Venda</h3>
                  <form onSubmit={handleSellVehicle} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Preço de Venda</label>
                      <input
                        type="number"
                        value={salePrice}
                        onChange={(e) => setSalePrice(parseFloat(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasCommission"
                        checked={hasCommission}
                        onChange={(e) => setHasCommission(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="hasCommission" className="ml-2 block text-sm text-gray-900">
                        Possui comissão de vendedor?
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Registrar Venda
                    </button>
                  </form>
                </div>
              )}

              {vehicle.status === 'sold' && vehicle.saleInfo && (
                <div className="bg-white rounded-xl shadow-card p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Informações da Venda</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Data da Venda</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {formatDate(vehicle.saleInfo.saleDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Valor da Venda</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        ${vehicle.saleInfo.salePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">Lucro</span>
                        <span className={`font-medium text-sm sm:text-base ${
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Selecione as imagens para excluir
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedImagesForDeletion([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {vehicle.images.map((image) => (
                <div
                  key={image.id}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                    selectedImagesForDeletion.includes(image.id)
                      ? 'ring-2 ring-red-500'
                      : ''
                  }`}
                  onClick={() => toggleImageSelection(image.id)}
                >
                  <Image
                    src={image.url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity ${
                    selectedImagesForDeletion.includes(image.id)
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <svg
                      className={`w-8 h-8 ${
                        selectedImagesForDeletion.includes(image.id)
                          ? 'text-red-500'
                          : 'text-white'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {selectedImagesForDeletion.includes(image.id) ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      )}
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedImagesForDeletion([]);
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteSelectedImages}
                disabled={selectedImagesForDeletion.length === 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Excluir {selectedImagesForDeletion.length} imagem(ns)
              </button>
            </div>
          </div>
        </div>
      )}

      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Selecione as imagens para baixar
              </h3>
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setSelectedImagesForDownload([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
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

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setSelectedImagesForDownload([]);
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDownloadSelectedImages}
                disabled={selectedImagesForDownload.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Baixar {selectedImagesForDownload.length} imagem(ns)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Descrição do Veículo */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Descrição do Veículo</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {vehicle.description ? 'Editar' : 'Adicionar'} Descrição
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedVehicle?.description || ''}
              onChange={(e) => setEditedVehicle(prev => prev ? { ...prev, description: e.target.value } : null)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Insira uma descrição detalhada do veículo..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedVehicle(vehicle);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {vehicle.description || 'Nenhuma descrição cadastrada. Clique em "Adicionar Descrição" para incluir os detalhes do veículo.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 