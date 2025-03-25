'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { Vehicle } from '@prisma/client';
import Link from 'next/link';

interface InstitutionalContentProps {
  vehicles: (Vehicle & {
    images: { url: string }[];
    marketPrices: { retail: number } | null;
  })[];
}

export default function InstitutionalContent({ vehicles }: InstitutionalContentProps) {
  const { translations } = useLanguage();

  if (!translations?.home?.values?.values) {
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      {/* Valores Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{translations.home.values.title}</h2>
        <p className="text-xl text-gray-600">{translations.home.values.subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {translations.home.values.values.map((value, index) => (
          <div 
            key={index}
            className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow"
          >
            <h3 className="text-xl font-bold mb-4 text-primary-900">{value.title}</h3>
            <p className="text-gray-700">{value.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 