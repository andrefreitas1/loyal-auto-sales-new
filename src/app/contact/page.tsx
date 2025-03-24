'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Vehicle } from '@prisma/client';
import Image from 'next/image';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import InstitutionalNavbar from '@/components/InstitutionalNavbar';

interface VehicleWithPrices extends Vehicle {
  marketPrices: {
    retail: number;
  } | null;
  images: {
    id: string;
    url: string;
  }[];
}

export default function ContactPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleWithPrices | null>(null);
  const [vehicles, setVehicles] = useState<VehicleWithPrices[]>([]);

  useEffect(() => {
    const vehicleId = searchParams.get('vehicleId');
    if (vehicleId) {
      fetchVehicle(vehicleId);
    }
    fetchVehicles();
  }, [searchParams]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles?status=FOR_SALE');
      if (!response.ok) throw new Error('Erro ao buscar veículos');
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      toast.error('Erro ao carregar veículos disponíveis');
    }
  };

  const fetchVehicle = async (id: string) => {
    try {
      const response = await fetch(`/api/vehicles/${id}/public`);
      if (!response.ok) throw new Error('Erro ao buscar veículo');
      const data = await response.json();
      console.log('Veículo carregado:', data);
      setVehicle(data);
    } catch (error) {
      console.error('Erro ao buscar veículo:', error);
      toast.error('Erro ao carregar informações do veículo');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      vehicleId: vehicle?.id
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar formulário');
      }

      toast.success('Mensagem enviada com sucesso!');
      router.push('/institutional');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <InstitutionalNavbar />
      <div className="relative isolate">
        {/* Background pattern */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-primary-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Entre em Contato
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                {vehicle 
                  ? `Interessado no ${vehicle.brand} ${vehicle.model} ${vehicle.year}?`
                  : 'Selecione um veículo e preencha o formulário abaixo. Entraremos em contato o mais breve possível.'}
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20">
              {/* Seleção de Veículo */}
              <div className="mb-8">
                <Listbox value={vehicle} onChange={setVehicle}>
                  <div className="relative">
                    <Listbox.Label className="block text-sm font-medium text-gray-300 mb-2">
                      Selecione o Veículo
                    </Listbox.Label>
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white/5 py-2 pl-3 pr-10 text-left border border-gray-600 focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-opacity-75 sm:text-sm">
                      <span className="block truncate text-white">
                        {vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : 'Selecione um veículo'}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {vehicles.map((v) => (
                        <Listbox.Option
                          key={v.id}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-primary-600 text-white' : 'text-gray-300'
                            }`
                          }
                          value={v}
                        >
                          {({ selected, active }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                {v.brand} {v.model} {v.year}
                              </span>
                              {selected ? (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? 'text-white' : 'text-primary-400'
                                  }`}
                                >
                                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>

              {/* Detalhes do Veículo Selecionado */}
              {vehicle && (
                <div className="mb-8 overflow-hidden rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
                  <div className="flex items-start space-x-4">
                    {vehicle.images[0] && (
                      <div className="relative h-24 w-32 flex-shrink-0">
                        <Image
                          src={vehicle.images[0].url}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Ano</p>
                          <p className="text-white">{vehicle.year}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Cor</p>
                          <p className="text-white">{vehicle.color}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Milhagem</p>
                          <p className="text-white">
                            {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : 'N/A'}
                          </p>
                        </div>
                        {vehicle.marketPrices?.retail && (
                          <div>
                            <p className="text-gray-400">Preço</p>
                            <p className="text-lg font-bold text-primary-400">
                              ${vehicle.marketPrices.retail.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulário */}
              <div className="bg-white/5 rounded-2xl p-8 ring-1 ring-white/10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                        Nome
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          autoComplete="given-name"
                          required
                          className="block w-full rounded-lg border-gray-600 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                          placeholder="Seu nome"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                        Último Nome
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          autoComplete="family-name"
                          required
                          className="block w-full rounded-lg border-gray-600 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                          placeholder="Seu último nome"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <div className="mt-2">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          autoComplete="email"
                          required
                          className="block w-full rounded-lg border-gray-600 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                        Telefone
                      </label>
                      <div className="mt-2">
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          autoComplete="tel"
                          required
                          className="block w-full rounded-lg border-gray-600 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                          placeholder="(123) 456-7890"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || !vehicle}
                      className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        'Enviar Mensagem'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Background pattern */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-200 to-primary-400 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </div>
    </div>
  );
} 