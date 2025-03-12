'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
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
    } | null;
    images: {
      id: string;
      url: string;
    }[];
  };
}

export default function CustomerList() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [operators, setOperators] = useState<{ id: string; name: string }[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>('');

  useEffect(() => {
    fetchCustomers();
    if (session?.user?.role === 'admin') {
      fetchOperators();
    }
  }, [session]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchOperators = async () => {
    try {
      const response = await fetch('/api/users?role=operator');
      if (response.ok) {
        const data = await response.json();
        setOperators(data);
      }
    } catch (error) {
      console.error('Erro ao buscar operadores:', error);
    }
  };

  const filteredCustomers = selectedOperator
    ? customers.filter(customer => customer.operator.id === selectedOperator)
    : customers;

  if (loading) {
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
          {/* Cabeçalho */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Clientes Interessados</h1>
            <Link
              href="/protected/customers/new"
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              Novo Cliente
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {/* Filtro por Operador (apenas para admin) */}
          {session?.user?.role === 'admin' && (
            <div className="mb-6">
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos os Operadores</option>
                {operators.map(operator => (
                  <option key={operator.id} value={operator.id}>
                    {operator.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Lista de Clientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <Link
                key={customer.id}
                href={`/protected/customers/${customer.id}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{customer.fullName}</h2>
                      <p className="text-sm text-gray-500">
                        Cadastrado por: {customer.operator.name}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Veículo de Interesse</h3>
                      <p className="text-gray-900">
                        {customer.vehicle.brand} {customer.vehicle.model} ({customer.vehicle.year})
                      </p>
                      <p className="text-primary-600 font-medium">
                        {formatCurrency(customer.vehicle.marketPrices?.retail || 0)}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center text-gray-600 mt-2">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-600">
                Nenhum cliente cadastrado
              </h2>
              <p className="text-gray-500 mt-2">
                Comece cadastrando um novo cliente interessado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 