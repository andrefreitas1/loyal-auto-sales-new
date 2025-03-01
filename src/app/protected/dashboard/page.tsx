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
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho com Gradiente */}
        <div className="relative mb-8 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-2">
              Bem-vindo à Loyal Auto Sales
            </h1>
            <p className="text-primary-100">
              Sistema de gestão de veículos - Orlando, Florida
            </p>
          </div>
          <div className="absolute right-0 top-0 w-64 h-full opacity-10">
            <TruckIcon className="w-full h-full" />
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna da Esquerda */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cards de Estatísticas em Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <TruckIcon className="h-8 w-8 opacity-75" />
                  <span className="text-2xl font-bold">{stats.acquired}</span>
                </div>
                <p className="text-sm font-medium text-yellow-100">Adquiridos</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <WrenchScrewdriverIcon className="h-8 w-8 opacity-75" />
                  <span className="text-2xl font-bold">{stats.inPreparation}</span>
                </div>
                <p className="text-sm font-medium text-blue-100">Em Preparação</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingCartIcon className="h-8 w-8 opacity-75" />
                  <span className="text-2xl font-bold">{stats.forSale}</span>
                </div>
                <p className="text-sm font-medium text-green-100">À Venda</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircleIcon className="h-8 w-8 opacity-75" />
                  <span className="text-2xl font-bold">{stats.sold}</span>
                </div>
                <p className="text-sm font-medium text-purple-100">Vendidos</p>
              </div>
            </div>

            {/* Carrossel de Imagens com Design Melhorado */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <ShoppingCartIcon className="h-6 w-6 mr-2 text-primary-400" />
                Veículos em Destaque
              </h2>
              {recentVehicles.length > 0 ? (
                <div className="relative">
                  <div className="relative h-[400px] rounded-lg overflow-hidden">
                    {!imageErrors[recentVehicles[currentImageIndex].id] && (
                      <Image
                        src={recentVehicles[currentImageIndex].images[0].url}
                        alt={`${recentVehicles[currentImageIndex].brand} ${recentVehicles[currentImageIndex].model}`}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(recentVehicles[currentImageIndex].id)}
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
                      <h3 className="text-2xl font-bold text-white">
                        {recentVehicles[currentImageIndex].brand} {recentVehicles[currentImageIndex].model}
                      </h3>
                      <p className="text-primary-200 text-lg">
                        {recentVehicles[currentImageIndex].year}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={previousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transform hover:scale-110 transition-transform"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transform hover:scale-110 transition-transform"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                  <div className="flex justify-center mt-4 gap-2">
                    {recentVehicles.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 w-8 rounded-full transition-all ${
                          currentImageIndex === index ? 'bg-primary-500' : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Nenhum veículo com imagens disponível
                </div>
              )}
            </div>

            {/* Cards Financeiros em Grid */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Investimento Total</h3>
                  <svg className="h-6 w-6 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold">${stats.totalInvestment.toLocaleString()}</p>
                <p className="text-sm text-orange-200 mt-2">Compras + custos</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Receita Total</h3>
                  <svg className="h-6 w-6 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-emerald-200 mt-2">Valor total das vendas</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Despesas Totais</h3>
                  <svg className="h-6 w-6 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold">${stats.totalExpenses.toLocaleString()}</p>
                <p className="text-sm text-red-200 mt-2">Custos e manutenções</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Lucro Total</h3>
                  <svg className="h-6 w-6 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-3xl font-bold">${stats.totalProfit.toLocaleString()}</p>
                <p className="text-sm text-blue-200 mt-2">Resultado líquido</p>
              </div>
            </div>
          </div>

          {/* Coluna da Direita */}
          <div className="space-y-8">
            {/* Descrição do Sistema */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <DocumentChartBarIcon className="h-6 w-6 mr-2 text-primary-400" />
                Recursos do Sistema
              </h2>
              <div className="space-y-6">
                <div className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <TruckIcon className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-white">Gestão de Inventário</h3>
                      <p className="text-gray-400">Controle completo do seu estoque de veículos, desde a aquisição até a venda.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <WrenchScrewdriverIcon className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-white">Controle de Manutenção</h3>
                      <p className="text-gray-400">Acompanhamento detalhado de todas as manutenções e custos associados.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-white">Análise Financeira</h3>
                      <p className="text-gray-400">Relatórios detalhados de receitas, despesas e lucratividade.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <DocumentChartBarIcon className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-white">Preços de Mercado</h3>
                      <p className="text-gray-400">Acompanhamento dos preços Wholesale, MMR, Retail e Repasse.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="space-y-4">
              <Link href="/protected/vehicles/new" 
                className="block bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow transform hover:scale-105">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-primary-400/20">
                    <PlusCircleIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Novo Veículo</h3>
                    <p className="text-primary-200">Cadastrar veículo</p>
                  </div>
                </div>
              </Link>

              <Link href="/protected/vehicles" 
                className="block bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow transform hover:scale-105">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-400/20">
                    <TruckIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Inventário</h3>
                    <p className="text-green-200">Gerenciar veículos</p>
                  </div>
                </div>
              </Link>

              <Link href="/protected/reports" 
                className="block bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow transform hover:scale-105">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-400/20">
                    <DocumentChartBarIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Relatórios</h3>
                    <p className="text-yellow-200">Ver análises</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 