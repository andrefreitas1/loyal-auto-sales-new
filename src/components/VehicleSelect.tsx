'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Vehicle } from '@/types';

interface VehicleSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function VehicleSelect({ value, onChange, required = false }: VehicleSelectProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles');
        if (!response.ok) throw new Error('Erro ao carregar veículos');
        const data = await response.json();
        setVehicles(data.filter((vehicle: Vehicle) => vehicle.status === 'for_sale'));
      } catch (error) {
        console.error('Erro ao carregar veículos:', error);
      }
    };

    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.year.toString().includes(searchTerm)
  );

  const selectedVehicle = vehicles.find(v => v.id === value);

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white cursor-pointer flex items-center justify-between"
      >
        {selectedVehicle ? (
          <div className="flex items-center gap-3">
            {selectedVehicle.images[0] && (
              <div className="relative w-8 h-8 rounded overflow-hidden">
                <Image
                  src={selectedVehicle.images[0].url}
                  alt={selectedVehicle.model}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <span>{`${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year}`}</span>
          </div>
        ) : (
          <span className="text-gray-400">Selecione um veículo</span>
        )}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Buscar veículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-gray-400"
            />
          </div>
          <div className="py-1">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => {
                  onChange(vehicle.id);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 cursor-pointer"
              >
                {vehicle.images[0] && (
                  <div className="relative w-10 h-10 rounded overflow-hidden">
                    <Image
                      src={vehicle.images[0].url}
                      alt={vehicle.model}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="text-sm text-white">
                    {`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
                  </div>
                  <div className="text-xs text-gray-400">
                    {vehicle.color}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 