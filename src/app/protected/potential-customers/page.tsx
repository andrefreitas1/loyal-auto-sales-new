'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  BellIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  ClockIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Vehicle {
  brand: string;
  model: string;
  year: number;
}

interface PotentialCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  isRead: boolean;
  vehicle?: Vehicle;
}

export default function PotentialCustomersPage() {
  const [customers, setCustomers] = useState<PotentialCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | '24h' | 'week' | 'unread'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/potential-customers');
      if (!response.ok) throw new Error('Erro ao carregar contatos');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      toast.error('Erro ao carregar contatos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadToggle = async (id: string, currentIsRead: boolean) => {
    try {
      const response = await fetch(`/api/potential-customers/${id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: !currentIsRead }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar status');

      // Atualiza a lista localmente
      setCustomers(customers.map(customer => 
        customer.id === id 
          ? { ...customer, isRead: !currentIsRead }
          : customer
      ));
      toast.success('Status atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/potential-customers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir contato');

      // Remove da lista local
      setCustomers(customers.filter(customer => customer.id !== id));
      setShowDeleteConfirm(null);
      toast.success('Contato excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir contato:', error);
      toast.error('Erro ao excluir contato');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const now = new Date();
    const customerDate = new Date(customer.createdAt);
    const hoursDiff = (now.getTime() - customerDate.getTime()) / (1000 * 60 * 60);
    const daysDiff = hoursDiff / 24;

    switch (filter) {
      case '24h':
        return hoursDiff <= 24;
      case 'week':
        return daysDiff <= 7;
      case 'unread':
        return !customer.isRead;
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Cabeçalho */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BellIcon className="h-6 w-6 mr-2 text-primary-600" />
                Clientes Potenciais
              </h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === 'unread'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Não Lidas
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === 'all'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter('24h')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === '24h'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Últimas 24h
                </button>
                <button
                  onClick={() => setFilter('week')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === 'week'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Última Semana
                </button>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100vh-12rem)]">
            {/* Lista de Clientes */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer.id)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedCustomer === customer.id ? 'bg-primary-50' : ''
                  } ${!customer.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      {!customer.isRead && (
                        <span className="h-2 w-2 bg-blue-600 rounded-full mr-2" />
                      )}
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                  {customer.vehicle && (
                    <p className="text-sm text-gray-600 mb-1">
                      {customer.vehicle.brand} {customer.vehicle.model} {customer.vehicle.year}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-gray-500">
                    <EnvelopeIcon className="h-4 w-4 mr-1" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detalhes do Cliente */}
            <div className="w-2/3 bg-white p-6 overflow-y-auto">
              {selectedCustomer ? (
                <div>
                  {(() => {
                    const customer = customers.find(c => c.id === selectedCustomer);
                    if (!customer) return null;

                    return (
                      <>
                        <div className="mb-6">
                          <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                              {customer.firstName} {customer.lastName}
                            </h2>
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReadToggle(customer.id, customer.isRead);
                                }}
                                className={`p-2 rounded-full ${
                                  customer.isRead 
                                    ? 'text-gray-400 hover:text-gray-600' 
                                    : 'text-blue-600 hover:text-blue-800'
                                }`}
                                title={customer.isRead ? "Marcar como não lido" : "Marcar como lido"}
                              >
                                {customer.isRead ? <XCircleIcon className="h-6 w-6" /> : <CheckCircleIcon className="h-6 w-6" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm(customer.id);
                                }}
                                className="p-2 rounded-full text-red-600 hover:text-red-800"
                                title="Excluir"
                              >
                                <TrashIcon className="h-6 w-6" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-gray-500">
                            <ClockIcon className="h-5 w-5" />
                            <span>
                              {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true, locale: ptBR })}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Informações de Contato
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                              <a
                                href={`mailto:${customer.email}`}
                                className="text-primary-600 hover:text-primary-700"
                              >
                                {customer.email}
                              </a>
                            </div>
                            <div className="flex items-center">
                              <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                              <a
                                href={`tel:${customer.phone}`}
                                className="text-primary-600 hover:text-primary-700"
                              >
                                {customer.phone}
                              </a>
                            </div>
                          </div>
                        </div>

                        {customer.vehicle && (
                          <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Veículo de Interesse
                            </h3>
                            <div className="text-gray-700">
                              <p className="text-xl font-medium">
                                {customer.vehicle.brand} {customer.vehicle.model}
                              </p>
                              <p className="text-gray-500">
                                Ano: {customer.vehicle.year}
                              </p>
                            </div>
                          </div>
                        )}

                        {showDeleteConfirm === customer.id && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                              <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Confirmar Exclusão
                              </h3>
                              <p className="text-gray-500 mb-6">
                                Tem certeza que deseja excluir este cliente potencial? Esta ação não pode ser desfeita.
                              </p>
                              <div className="flex justify-end space-x-3">
                                <button
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => handleDelete(customer.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                  Excluir
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <BellIcon className="h-12 w-12 mb-4" />
                  <p>Selecione um cliente para ver os detalhes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 