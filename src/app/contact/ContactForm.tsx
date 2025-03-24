'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Vehicle } from '@prisma/client';
import Image from 'next/image';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface VehicleWithPrices extends Vehicle {
  marketPrices: {
    retail: number;
  } | null;
  images: {
    id: string;
    url: string;
  }[];
}

function ContactFormContent() {
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Nome
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Sobrenome
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Telefone
        </label>
        <input
          type="tel"
          name="phone"
          id="phone"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700">
          Veículo de Interesse
        </label>
        <Listbox value={vehicle} onChange={setVehicle}>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
              <span className="block truncate">
                {vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : 'Selecione um veículo'}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {vehicles.map((v) => (
                <Listbox.Option
                  key={v.id}
                  value={v}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                      active ? 'bg-blue-600 text-white' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                        {v.brand} {v.model} {v.year}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                            active ? 'text-white' : 'text-blue-600'
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

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Mensagem'}
        </button>
      </div>
    </form>
  );
}

export default function ContactForm() {
  return (
    <Suspense fallback={<div>Carregando formulário...</div>}>
      <ContactFormContent />
    </Suspense>
  );
} 