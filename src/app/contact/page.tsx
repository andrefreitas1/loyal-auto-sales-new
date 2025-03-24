'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Vehicle } from '@prisma/client';
import Image from 'next/image';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import InstitutionalNavbar from '@/components/InstitutionalNavbar';
import ContactForm from './ContactForm';

interface VehicleWithPrices extends Vehicle {
  marketPrices: {
    retail: number;
  } | null;
  images: {
    id: string;
    url: string;
  }[];
}

// Página de contato com formulário e seleção de veículo
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Entre em Contato
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Estamos aqui para ajudar você a encontrar o carro dos seus sonhos.
          </p>
        </div>
        <div className="mt-12">
          <ContactForm />
        </div>
      </div>
    </div>
  );
} 