'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Vehicle } from '@prisma/client';
import Link from 'next/link';
import { Carousel } from '@/components/Carousel';
import InstitutionalContent from '@/app/institutional/InstitutionalContent';
import ContactNavbar from '@/components/ContactNavbar';
import Image from 'next/image';

export default function HomePage() {
  const { translations } = useLanguage();
  const [featuredVehicles, setFeaturedVehicles] = useState<(Vehicle & {
    images: { url: string }[];
    marketPrices: { retail: number } | null;
  })[]>([]);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles');
        const data = await response.json();
        setFeaturedVehicles(data);
        
        // Coletar apenas a primeira imagem de cada veículo para o carrossel
        const firstImages = data.map((vehicle: Vehicle & { images: { url: string }[] }) => 
          vehicle.images[0]?.url
        ).filter(Boolean); // Remove valores undefined/null
        
        setCarouselImages(firstImages);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="min-h-screen bg-primary-50">
      <ContactNavbar />
      
      {/* Hero Section with Carousel Background */}
      <section className="relative h-screen">
        {/* Carousel Background */}
        <div className="absolute inset-0">
          {carouselImages.length > 0 && (
            <Carousel images={carouselImages} />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Welcome Content */}
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-6">{translations.home.hero.title}</h1>
            <p className="text-xl mb-8">{translations.home.hero.description}</p>
            <div className="flex space-x-4">
              <Link
                href="#historia"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                {translations.home.hero.historyButton}
              </Link>
              <Link
                href="#valores"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                {translations.home.hero.valuesButton}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* História Section */}
      <section id="historia" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-primary-900">{translations.home.history.title}</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 mb-6">{translations.home.history.paragraph1}</p>
            <p className="text-lg text-gray-700 mb-6">{translations.home.history.paragraph2}</p>
            <p className="text-lg text-gray-700">{translations.home.history.paragraph3}</p>
          </div>
        </div>
      </section>

      {/* Institutional Content */}
      <section id="valores" className="py-16 bg-primary-50">
        <InstitutionalContent vehicles={featuredVehicles} />
      </section>

      {/* Seção de Veículos em Destaque */}
      <section id="veiculos-destaque" className="bg-white">
        <div className="container mx-auto px-4 pt-32 pb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary-900">
            {translations.home.featuredVehicles.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={vehicle.images[0]?.url || ''}
                    alt={vehicle.brand + ' ' + vehicle.model}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{vehicle.brand} {vehicle.model}</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>{translations.home.featuredVehicles.year}: {vehicle.year}</p>
                    <p>{translations.home.featuredVehicles.color}: {vehicle.color}</p>
                    <p>{translations.home.featuredVehicles.mileage}: {vehicle.mileage}</p>
                  </div>
                  <div className="mt-4 mb-4">
                    <p className="text-sm text-gray-500">{translations.home.featuredVehicles.price}</p>
                    <p className="text-2xl font-bold text-blue-600">${(vehicle.marketPrices?.retail || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <Link
                    href="/contact"
                    className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {translations.home.featuredVehicles.contactButton}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 