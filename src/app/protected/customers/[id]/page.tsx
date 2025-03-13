'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/utils/format';

interface Customer {
  id: string;
  fullName: string;
  birthDate: string;
  phone: string;
  email: string | null;
  passportUrl: string;
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

export default function CustomerDetails() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchCustomer();
    }
  }, [params.id]);

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

          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{customer.fullName}</h1>
              <p className="text-gray-500">
                Cadastrado por {customer.operator.name} em{' '}
                {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna da Esquerda - Informações do Cliente */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações do Cliente</h2>
                <div className="space-y-4">
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
                </div>
              </div>

              {/* Passaporte */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Passaporte</h2>
                <div className="relative aspect-[3/2] rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={customer.passportUrl}
                    alt="Passaporte"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                </div>
                <a 
                  href={customer.passportUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-primary-600 hover:text-primary-700"
                >
                  Ver imagem original
                </a>
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
    </div>
  );
} 