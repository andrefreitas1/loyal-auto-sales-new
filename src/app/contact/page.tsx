'use client';

import { Suspense } from 'react';
import ContactForm from '@/app/contact/ContactForm';
import ContactNavbar from '@/components/ContactNavbar';
import { useLanguage } from '@/hooks/useLanguage';

export default function ContactPage() {
  const { translations } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <ContactNavbar />
      
      <main className="container mx-auto px-4 pt-32 pb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">{translations.contact.title}</h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                {translations.contact.description}
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
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
      </main>
    </div>
  );
} 