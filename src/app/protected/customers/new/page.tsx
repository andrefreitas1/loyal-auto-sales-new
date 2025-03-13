'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Vehicle } from '@/types/vehicle';
import { formatCurrency } from '@/utils/format';

interface CustomerFormData {
  fullName: string;
  birthDate: string;
  phone: string;
  email: string;
  passportFile: File | null;
  vehicleId: string;
}

export default function NewCustomer() {
  const router = useRouter();
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: '',
    birthDate: '',
    phone: '',
    email: '',
    passportFile: null,
    vehicleId: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const allVehicles = await response.json();
        const forSaleVehicles = allVehicles.filter((v: Vehicle) => v.status === 'for_sale');
        setVehicles(forSaleVehicles);
      }
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      setError('Erro ao carregar veículos disponíveis');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Primeiro, faz upload do passaporte
      if (!formData.passportFile) {
        throw new Error('Por favor, selecione um arquivo de passaporte');
      }

      const formDataUpload = new FormData();
      formDataUpload.append('file', formData.passportFile);

      const uploadResponse = await fetch('/api/upload-passport', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!uploadResponse.ok) {
        throw new Error('Erro ao fazer upload do passaporte');
      }

      const { url: passportUrl } = await uploadResponse.json();

      // Depois, cria o cliente
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          birthDate: new Date(formData.birthDate).toISOString(),
          phone: formData.phone,
          email: formData.email,
          vehicleId: formData.vehicleId,
          passportUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar cliente');
      }

      router.push('/protected/customers');
    } catch (error) {
      console.error('Erro:', error);
      setError(error instanceof Error ? error.message : 'Erro ao cadastrar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        passportFile: e.target.files![0]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cadastrar Novo Cliente</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados Pessoais</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passaporte (Upload)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Veículo de Interesse */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Veículo de Interesse</h2>
                <div className="grid grid-cols-1 gap-6">
                  {vehicles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vehicles.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            formData.vehicleId === vehicle.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, vehicleId: vehicle.id }))}
                        >
                          {vehicle.images && vehicle.images.length > 0 && (
                            <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                              <Image
                                src={vehicle.images[0].url}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <h3 className="font-medium text-gray-900">
                              {vehicle.brand} {vehicle.model} ({vehicle.year})
                            </h3>
                            <p className="text-sm text-gray-600">VIN: {vehicle.vin}</p>
                            <p className="text-sm font-medium text-primary-600">
                              {formatCurrency(vehicle.marketPrices?.retail || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Nenhum veículo disponível para venda no momento.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading || !formData.vehicleId}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                    Cadastrando...
                  </div>
                ) : (
                  'Cadastrar Cliente'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 