import { Suspense } from 'react';
import ContactForm from './ContactForm';
import ContactNavbar from '@/components/ContactNavbar';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ContactNavbar />
      <div className="container mx-auto px-4 pt-32 pb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Entre em Contato
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Estamos aqui para ajudar você a encontrar o carro dos seus sonhos.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Suspense fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            }>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 