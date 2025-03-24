'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Vehicle } from '@prisma/client';

interface HeroCarouselProps {
  vehicles: (Vehicle & {
    images: {
      id: string;
      url: string;
    }[];
  })[];
}

export default function HeroCarousel({ vehicles = [] }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filtra apenas veículos com imagens
  const vehiclesWithImages = vehicles.filter(vehicle => vehicle.images && vehicle.images.length > 0);

  useEffect(() => {
    if (vehiclesWithImages.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === vehiclesWithImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [vehiclesWithImages.length]);

  if (vehiclesWithImages.length === 0) {
    return (
      <div className="relative h-[600px] bg-gray-800">
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Loyal Auto Sales
            </h1>
            <p className="text-xl md:text-2xl text-primary-200 max-w-2xl mx-auto">
              Realize seu sonho de ter um carro nos Estados Unidos com a confiança e segurança que você merece
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] overflow-hidden">
      {/* Carrossel de Imagens */}
      {vehiclesWithImages.map((vehicle, index) => (
        <div
          key={vehicle.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={vehicle.images[0].url}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
      ))}

      {/* Cabeçalho Estático */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Loyal Auto Sales
          </h1>
          <p className="text-xl md:text-2xl text-primary-200 max-w-2xl mx-auto">
            Realize seu sonho de ter um carro nos Estados Unidos com a confiança e segurança que você merece
          </p>
        </div>
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {vehiclesWithImages.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 w-8 rounded-full transition-all ${
              index === currentIndex ? 'bg-primary-500' : 'bg-gray-600 hover:bg-gray-500'
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 