import { Suspense } from 'react';
import ContactForm from './ContactForm';

export default function ContactPage() {
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
          <Suspense fallback={<div>Carregando formulário...</div>}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 