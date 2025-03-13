'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/utils/format';

interface Customer {
  id: string;
  fullName: string;
  birthDate: string;
  phone: string;
  email: string | null;
  passportUrl: string;
  status: string;
  createdAt: string;
  operator: {
    id: string;
    name: string;
  };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    vin: string;
    mileage: number;
    marketPrices: {
      retail: number;
      mmr: number;
      wholesale: number;
      repasse: number;
    } | null;
    images: {
      id: string;
      url: string;
    }[];
  };
}

const statusOptions = [
  { value: 'new', label: 'Novo Cliente' },
  { value: 'analysis', label: 'Em Análise' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'rejected', label: 'Reprovado' },
];

export default function CustomerDetails() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<Partial<Customer> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCustomer();
    }
  }, [params.id]);

  useEffect(() => {
    if (customer && !editedCustomer) {
      setEditedCustomer({
        fullName: customer.fullName,
        birthDate: customer.birthDate.split('T')[0],
        phone: customer.phone,
        email: customer.email,
      });
    }
  }, [customer]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      } else {
        throw new Error('Cliente não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      setError('Erro ao carregar informações do cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!customer || updating) return;
    
    try {
      setUpdating(true);
      const response = await fetch(`/api/customers/${customer.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedCustomer = await response.json();
        setCustomer(updatedCustomer);
      } else {
        throw new Error('Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setError('Erro ao atualizar status do cliente');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadPassport = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!customer) return;

    try {
      const response = await fetch(customer.passportUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `passaporte_${customer.fullName.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar passaporte:', error);
      setError('Erro ao baixar passaporte');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCustomer(customer ? {
      fullName: customer.fullName,
      birthDate: customer.birthDate.split('T')[0],
      phone: customer.phone,
      email: customer.email,
    } : null);
  };

  const handleSaveEdit = async () => {
    if (!customer || !editedCustomer) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedCustomer),
      });

      if (response.ok) {
        const updatedCustomer = await response.json();
        setCustomer(updatedCustomer);
        setIsEditing(false);
      } else {
        throw new Error('Erro ao atualizar cliente');
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      setError('Erro ao atualizar informações do cliente');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!customer) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/protected/customers');
      } else {
        throw new Error('Erro ao excluir cliente');
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      setError('Erro ao excluir cliente');
    } finally {
      setUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              {error || 'Cliente não encontrado'}
            </h1>
            <Link
              href="/protected/customers"
              className="text-primary-600 hover:text-primary-700"
            >
              Voltar para lista de clientes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-6">
            <Link href="/protected/customers" className="hover:text-primary-600 transition-colors">
              Clientes
            </Link>
            <span>/</span>
            <span>{customer.fullName}</span>
          </div>

          {/* Cabeçalho com Ações */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{customer.fullName}</h1>
              <p className="text-gray-500">
                Cadastrado por {customer.operator.name} em{' '}
                {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {session?.user?.role === 'admin' && (
                <>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={updating}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Salvar
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Excluir
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna da Esquerda - Informações do Cliente */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Cliente</h2>
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input
                          type="text"
                          value={editedCustomer?.fullName || ''}
                          onChange={(e) => setEditedCustomer(prev => ({ ...prev!, fullName: e.target.value }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                        <input
                          type="date"
                          value={editedCustomer?.birthDate || ''}
                          onChange={(e) => setEditedCustomer(prev => ({ ...prev!, birthDate: e.target.value }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Telefone</label>
                        <input
                          type="tel"
                          value={editedCustomer?.phone || ''}
                          onChange={(e) => setEditedCustomer(prev => ({ ...prev!, phone: e.target.value }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={editedCustomer?.email || ''}
                          onChange={(e) => setEditedCustomer(prev => ({ ...prev!, email: e.target.value }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${customer.status === 'approved' ? 'bg-green-100 text-green-800' :
                          customer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          customer.status === 'analysis' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}
                        >
                          {statusOptions.find(opt => opt.value === customer.status)?.label || 'Novo Cliente'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Data de Nascimento</span>
                        <span className="font-medium">
                          {new Date(customer.birthDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Telefone</span>
                        <span className="font-medium">{customer.phone}</span>
                      </div>
                      {customer.email && (
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-gray-600">Email</span>
                          <span className="font-medium">{customer.email}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Passaporte */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Passaporte</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                    <div>
                      <p className="font-medium">Documento do Cliente</p>
                      <p className="text-sm text-gray-500">Clique no botão para baixar</p>
                    </div>
                  </div>
                  <a
                    href="#"
                    onClick={handleDownloadPassport}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Baixar Passaporte
                  </a>
                </div>
              </div>
            </div>

            {/* Coluna da Direita - Informações do Veículo */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Imagem Principal do Veículo */}
                {customer.vehicle.images && customer.vehicle.images.length > 0 && (
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={customer.vehicle.images[0].url}
                      alt={`${customer.vehicle.brand} ${customer.vehicle.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Informações do Veículo */}
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Veículo de Interesse
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Marca</span>
                        <span className="font-medium">{customer.vehicle.brand}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Modelo</span>
                        <span className="font-medium">{customer.vehicle.model}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Ano</span>
                        <span className="font-medium">{customer.vehicle.year}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Cor</span>
                        <span className="font-medium">{customer.vehicle.color}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">VIN</span>
                        <span className="font-medium">{customer.vehicle.vin}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600">Quilometragem</span>
                        <span className="font-medium">{customer.vehicle.mileage.toLocaleString()} milhas</span>
                      </div>
                    </div>

                    {customer.vehicle.marketPrices && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-gray-600">Valor de Venda</span>
                          <span className="font-medium text-primary-600">
                            {formatCurrency(customer.vehicle.marketPrices.retail)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-gray-600">MMR</span>
                          <span className="font-medium">
                            {formatCurrency(customer.vehicle.marketPrices.mmr)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-gray-600">Repasse</span>
                          <span className="font-medium">
                            {formatCurrency(customer.vehicle.marketPrices.repasse)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600">Wholesale</span>
                          <span className="font-medium">
                            {formatCurrency(customer.vehicle.marketPrices.wholesale)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-500 mb-6">
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={updating}
                className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {updating ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 