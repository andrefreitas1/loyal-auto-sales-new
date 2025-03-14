'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Vehicle } from '@/types/vehicle';
import { formatCurrency } from '@/utils/format';

interface CustomerFormData {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  email: string;
  passportFile: File | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isRental: boolean;
  residenceYears: number;
  residenceMonths: number;
  profession: string;
  monthlyIncome: number;
  jobYears: number;
  jobMonths: number;
  vehicleId: string;
  residenceType: string;
}

export default function NewCustomer() {
  const router = useRouter();
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    email: '',
    passportFile: null,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    isRental: false,
    residenceYears: 0,
    residenceMonths: 0,
    profession: '',
    monthlyIncome: 0,
    jobYears: 0,
    jobMonths: 0,
    vehicleId: '',
    residenceType: 'RENTAL',
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
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDate: new Date(formData.birthDate).toISOString(),
          phone: formData.phone,
          email: formData.email,
          passportUrl,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          isRental: formData.isRental,
          residenceYears: formData.residenceYears,
          residenceMonths: formData.residenceMonths,
          profession: formData.profession,
          monthlyIncome: formData.monthlyIncome,
          jobYears: formData.jobYears,
          jobMonths: formData.jobMonths,
          vehicleId: formData.vehicleId,
          residenceType: formData.residenceType,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

            <div className="space-y-8">
              {/* Dados Pessoais */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primeiro Nome
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Último Nome
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
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
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          setFormData(prev => ({ ...prev, phone: value }));
                        }
                      }}
                      placeholder="(XXX) XXX-XXXX"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
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

                  <div className="md:col-span-2">
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

              {/* Dados de Residência */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados de Residência</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço Completo
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Imóvel
                    </label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="residenceType"
                          value="RENTAL"
                          checked={formData.residenceType === 'RENTAL'}
                          onChange={handleInputChange}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Casa de Aluguel</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="residenceType"
                          value="MORTGAGE"
                          checked={formData.residenceType === 'MORTGAGE'}
                          onChange={handleInputChange}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Hipoteca</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="residenceType"
                          value="OWNED"
                          checked={formData.residenceType === 'OWNED'}
                          onChange={handleInputChange}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Imóvel Próprio</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Anos de Residência
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.residenceYears}
                        onChange={(e) => setFormData(prev => ({ ...prev, residenceYears: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meses
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={formData.residenceMonths}
                        onChange={(e) => setFormData(prev => ({ ...prev, residenceMonths: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dados Profissionais */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados Profissionais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profissão
                    </label>
                    <input
                      type="text"
                      value={formData.profession}
                      onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Renda Bruta Mensal
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div className="flex gap-4 md:col-span-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Anos no Emprego Atual
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.jobYears}
                        onChange={(e) => setFormData(prev => ({ ...prev, jobYears: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Meses
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={formData.jobMonths}
                        onChange={(e) => setFormData(prev => ({ ...prev, jobMonths: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
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
                        <label
                          key={vehicle.id}
                          className={`relative flex flex-col bg-white p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            formData.vehicleId === vehicle.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="vehicle"
                            value={vehicle.id}
                            checked={formData.vehicleId === vehicle.id}
                            onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
                            className="sr-only"
                          />
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {vehicle.brand} {vehicle.model}
                              </h3>
                              <p className="text-sm text-gray-500">{vehicle.year}</p>
                            </div>
                            <div className="text-primary-600 font-medium">
                              {formatCurrency(vehicle.marketPrices?.retail || 0)}
                            </div>
                          </div>
                          {vehicle.images && vehicle.images.length > 0 && (
                            <div className="relative mt-2 aspect-[16/9] rounded-lg overflow-hidden">
                              <Image
                                src={vehicle.images[0].url}
                                alt={`${vehicle.brand} ${vehicle.model}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                        </label>
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