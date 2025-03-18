'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  TruckIcon, 
  WrenchScrewdriverIcon, 
  ShoppingCartIcon, 
  CheckCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlusCircleIcon,
  DocumentChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Vehicle } from '@/types';

interface DashboardStats {
  acquired: number;
  inPreparation: number;
  forSale: number;
  sold: number;
  totalVehicles: number;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalInvestment: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    acquired: 0,
    inPreparation: 0,
    forSale: 0,
    sold: 0,
    totalVehicles: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    totalInvestment: 0
  });
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const vehicles = await response.json();
        
        const totalInvestment = vehicles.reduce((acc: number, vehicle: Vehicle) => {
          const expenses = vehicle.expenses?.reduce((sum: number, expense) => sum + expense.amount, 0) || 0;
          return acc + vehicle.purchasePrice + expenses;
        }, 0);

        const totalRevenue = vehicles.reduce((acc: number, vehicle: Vehicle) => {
          return acc + (vehicle.saleInfo?.salePrice || 0);
        }, 0);

        const totalExpenses = vehicles.reduce((acc: number, vehicle: Vehicle) => {
          return acc + (vehicle.expenses?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0);
        }, 0);

        // Ajustando o cálculo do lucro total
        const totalProfit = totalRevenue - totalInvestment;

        setStats({
          acquired: vehicles.filter((v: Vehicle) => v.status === 'acquired').length,
          inPreparation: vehicles.filter((v: Vehicle) => v.status === 'in_preparation').length,
          forSale: vehicles.filter((v: Vehicle) => v.status === 'for_sale').length,
          sold: vehicles.filter((v: Vehicle) => v.status === 'sold').length,
          totalVehicles: vehicles.length,
          totalRevenue,
          totalExpenses,
          totalProfit,
          totalInvestment,
        });

        // Pegar os 5 veículos mais recentes com imagens
        setRecentVehicles(
          vehicles
            .filter((v: Vehicle) => v.images && v.images.length > 0)
            .slice(0, 5)
        );
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (vehicleId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [vehicleId]: true
    }));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === recentVehicles.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? recentVehicles.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Cabeçalho com Gradiente */}
        <div className="relative mb-4 sm:mb-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl sm:rounded-2xl p-4 sm:p-8 overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">
                  Bem-vindo à Loyal Auto Sales
                </h1>
                <p className="text-sm sm:text-base text-primary-100">
                  Sistema de gestão de veículos - Orlando, Florida
                </p>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-32 sm:w-64 h-full opacity-10">
            <TruckIcon className="w-full h-full" />
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Coluna da Esquerda */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Cards de Estatísticas em Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Link
                href="/protected/vehicles/acquired"
                className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 text-white transform hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <TruckIcon className="h-6 w-6 sm:h-8 sm:w-8 opacity-75" />
                  <span className="text-xl sm:text-2xl font-bold">{stats.acquired}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-yellow-100">Adquiridos</p>
              </Link>

              <Link
                href="/protected/vehicles/in-preparation"
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 text-white transform hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <WrenchScrewdriverIcon className="h-6 w-6 sm:h-8 sm:w-8 opacity-75" />
                  <span className="text-xl sm:text-2xl font-bold">{stats.inPreparation}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-blue-100">Em Preparação</p>
              </Link>

              <Link
                href="/protected/vehicles/for-sale"
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 text-white transform hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <ShoppingCartIcon className="h-6 w-6 sm:h-8 sm:w-8 opacity-75" />
                  <span className="text-xl sm:text-2xl font-bold">{stats.forSale}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-green-100">À Venda</p>
              </Link>

              <Link
                href="/protected/vehicles/sold"
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-6 text-white transform hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 opacity-75" />
                  <span className="text-xl sm:text-2xl font-bold">{stats.sold}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-purple-100">Vendidos</p>
              </Link>
            </div>

            {/* Carrossel de Imagens com Design Melhorado */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center">
                <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary-400" />
                Veículos em Destaque
              </h2>
              {recentVehicles.length > 0 ? (
                <div className="relative">
                  <div className="relative h-[200px] sm:h-[400px] rounded-lg overflow-hidden">
                    {!imageErrors[recentVehicles[currentImageIndex].id] && (
                      <Image
                        src={recentVehicles[currentImageIndex].images[0].url}
                        alt={`${recentVehicles[currentImageIndex].brand} ${recentVehicles[currentImageIndex].model}`}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(recentVehicles[currentImageIndex].id)}
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 sm:p-6">
                      <h3 className="text-lg sm:text-2xl font-bold text-white">
                        {recentVehicles[currentImageIndex].brand} {recentVehicles[currentImageIndex].model}
                      </h3>
                      <p className="text-sm sm:text-lg text-primary-200">
                        {recentVehicles[currentImageIndex].year}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={previousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transform hover:scale-110 transition-transform"
                  >
                    <ChevronLeftIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transform hover:scale-110 transition-transform"
                  >
                    <ChevronRightIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                  </button>
                  <div className="flex justify-center mt-3 sm:mt-4 gap-1 sm:gap-2">
                    {recentVehicles.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-1.5 sm:h-2 w-6 sm:w-8 rounded-full transition-all ${
                          currentImageIndex === index ? 'bg-primary-500' : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 text-gray-400 text-sm sm:text-base">
                  Nenhum veículo com imagens disponível
                </div>
              )}
            </div>
          </div>

          {/* Coluna da Direita */}
          <div className="space-y-4 sm:space-y-8">
            {/* Card de Resumo Financeiro */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary-400" />
                Resumo Financeiro
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Receita Total</span>
                  <span className="text-green-400 font-semibold">
                    ${stats.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Despesas Totais</span>
                  <span className="text-red-400 font-semibold">
                    ${stats.totalExpenses.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Investimento Total</span>
                  <span className="text-blue-400 font-semibold">
                    ${stats.totalInvestment.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 sm:pt-3 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Lucro Líquido</span>
                    <span className={`font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${stats.totalProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Ações Rápidas */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center">
                <PlusCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary-400" />
                Ações Rápidas
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <Link
                  href="/protected/vehicles/new"
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-gray-200">Adicionar Novo Veículo</span>
                  <PlusCircleIcon className="h-5 w-5 text-primary-400" />
                </Link>
                <Link
                  href="/protected/vehicles"
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-gray-200">Ver Todos os Veículos</span>
                  <TruckIcon className="h-5 w-5 text-primary-400" />
                </Link>
                <Link
                  href="/protected/reports"
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-gray-200">Ver Relatórios</span>
                  <DocumentChartBarIcon className="h-5 w-5 text-primary-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 