'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function ContactFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<any>(null);

  useEffect(() => {
    const vehicleId = searchParams.get('vehicleId');
    if (vehicleId) {
      fetchVehicle(vehicleId);
    }
  }, [searchParams]);

  const fetchVehicle = async (id: string) => {
    try {
      const response = await fetch(`/api/vehicles/${id}/public`);
      if (!response.ok) throw new Error('Veículo não encontrado');
      const data = await response.json();
      setVehicle(data);
    } catch (error) {
      console.error('Erro ao buscar veículo:', error);
      toast.error('Erro ao carregar informações do veículo');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        vehicleId: vehicle?.id,
        message: `Interesse no veículo: ${vehicle?.brand} ${vehicle?.model} ${vehicle?.year}`,
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Erro ao enviar mensagem');

      toast.success('Mensagem enviada com sucesso!');
      router.push('/');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}

export default function ContactForm() {
  return (
    <Suspense fallback={<div>Carregando formulário...</div>}>
      <ContactFormContent />
    </Suspense>
  );
} 