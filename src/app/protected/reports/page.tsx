'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  purchasePrice: number;
  purchaseDate: string;
  status: string;
  expenses: Array<{
    id: string;
    type: string;
    amount: number;
    date: string;
  }>;
  marketPrices?: {
    wholesale: number;
    mmr: number;
    retail: number;
    repasse: number;
  } | null;
  saleInfo?: {
    salePrice: number;
    saleDate: string;
  } | null;
  vin: string;
  color: string;
}

interface ReportData {
  totalVehicles: number;
  vehiclesByStatus: {
    acquired: Vehicle[];
    in_preparation: Vehicle[];
    for_sale: Vehicle[];
    sold: Vehicle[];
  };
  totalInvestment: number;
  totalExpenses: number;
  totalSales: number;
  totalProfit: number;
  expensesByType: {
    [key: string]: number;
  };
}

interface MarketPrice {
  wholesale: number;
  mmr: number;
  retail: number;
  repasse: number;
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData>({
    totalVehicles: 0,
    vehiclesByStatus: {
      acquired: [],
      in_preparation: [],
      for_sale: [],
      sold: []
    },
    totalInvestment: 0,
    totalExpenses: 0,
    totalSales: 0,
    totalProfit: 0,
    expensesByType: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [startDate, setStartDate] = useState('2025-02-28');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [isFiltered]);

  const handleFilter = () => {
    setIsFiltered(true);
  };

  const clearFilter = () => {
    setStartDate('2025-02-28');
    setEndDate(new Date().toISOString().split('T')[0]);
    setIsFiltered(false);
  };

  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const vehicles: Vehicle[] = await response.json();
        
        const vehiclesByStatus = {
          acquired: vehicles.filter(v => v.status === 'acquired'),
          in_preparation: vehicles.filter(v => v.status === 'in_preparation'),
          for_sale: vehicles.filter(v => v.status === 'for_sale'),
          sold: vehicles.filter(v => v.status === 'sold')
        };

        // Filtra despesas e vendas pelo período selecionado
        const filterByDate = (date: string | undefined | null) => {
          if (!date) return false;
          if (!isFiltered) return true;
          const itemDate = new Date(date);
          const start = new Date(startDate || '2025-02-28');
          const end = endDate ? new Date(endDate) : new Date();
          return itemDate >= start && itemDate <= end;
        };

        const totalInvestment = vehicles.reduce((sum, v) => sum + (v.purchasePrice || 0), 0);
        
        const totalExpenses = vehicles.reduce((sum, v) => 
          sum + (v.expenses || [])
            .filter(exp => filterByDate(exp.date))
            .reduce((expSum, exp) => expSum + (exp.amount || 0), 0), 0);
        
        const totalSales = vehicles
          .filter(v => v.saleInfo && filterByDate(v.saleInfo.saleDate))
          .reduce((sum, v) => sum + (v.saleInfo?.salePrice || 0), 0);

        const expensesByType = vehicles.reduce((types, v) => {
          (v.expenses || [])
            .filter(exp => filterByDate(exp.date))
            .forEach(exp => {
              types[exp.type] = (types[exp.type] || 0) + (exp.amount || 0);
            });
          return types;
        }, {} as { [key: string]: number });

        setReportData({
          totalVehicles: vehicles.length,
          vehiclesByStatus,
          totalInvestment,
          totalExpenses,
          totalSales,
          totalProfit: totalSales - totalInvestment - totalExpenses,
          expensesByType
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '$0.00';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateProfitMargin = (revenue: number, cost: number) => {
    if (cost === 0) return 0;
    return ((revenue - cost) / cost) * 100;
  };

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Configuração inicial do PDF
      doc.setFont('helvetica');
      
      // Adicionar o nome da empresa
      doc.setFontSize(24);
      doc.setTextColor(63, 81, 181); // cor primária
      doc.text('LOYAL AUTO SALES', 150, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Data do relatório: ${new Date().toLocaleDateString('pt-BR')}`, 150, 30, { align: 'center' });

      // Carros não vendidos (em estoque)
      const unsoldVehicles = [
        ...reportData.vehiclesByStatus.acquired,
        ...reportData.vehiclesByStatus.in_preparation,
        ...reportData.vehiclesByStatus.for_sale
      ];

      doc.setFontSize(16);
      doc.text('Veículos em Estoque', 20, 40);

      const unsoldHeaders = [
        ['Veículo', 'Data Aquisição', 'VIN', 'Custo Compra', 'Despesas', 'Preços de Mercado']
      ];

      const unsoldData = unsoldVehicles.map(vehicle => [
        `${vehicle.brand} ${vehicle.model} (${vehicle.year}) - ${vehicle.color}`,
        formatDate(vehicle.purchaseDate),
        vehicle.vin,
        formatCurrency(vehicle.purchasePrice),
        formatCurrency(vehicle.expenses.reduce((sum, exp) => sum + exp.amount, 0)),
        vehicle.marketPrices ? 
          `Wholesale: ${formatCurrency(vehicle.marketPrices.wholesale)}\n` +
          `MMR: ${formatCurrency(vehicle.marketPrices.mmr)}\n` +
          `Retail: ${formatCurrency(vehicle.marketPrices.retail)}\n` +
          `Repasse: ${formatCurrency(vehicle.marketPrices.repasse)}` : 'N/A'
      ]);

      autoTable(doc, {
        head: unsoldHeaders,
        body: unsoldData,
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [63, 81, 181] },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 
          0: { cellWidth: 60 },
          1: { cellWidth: 25 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 80 }
        }
      });

      // Carros vendidos em nova página
      doc.addPage();
      
      // Adicionar cabeçalho na nova página
      doc.setFontSize(24);
      doc.setTextColor(63, 81, 181);
      doc.text('LOYAL AUTO SALES', 150, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Veículos Vendidos', 20, 40);

      const soldVehicles = reportData.vehiclesByStatus.sold;
      const soldHeaders = [
        ['Veículo', 'Data Aquisição', 'Data Venda', 'VIN', 'Custo Total', 'Valor Venda', 'Lucro']
      ];

      const soldData = soldVehicles.map(vehicle => {
        const totalCost = vehicle.purchasePrice + 
          (vehicle.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0);
        const valorVenda = vehicle.saleInfo?.salePrice || 0;
        const lucro = valorVenda - totalCost;

        return [
          `${vehicle.brand} ${vehicle.model} (${vehicle.year}) - ${vehicle.color}`,
          formatDate(vehicle.purchaseDate),
          vehicle.saleInfo ? formatDate(vehicle.saleInfo.saleDate) : 'N/A',
          vehicle.vin,
          formatCurrency(totalCost),
          formatCurrency(valorVenda),
          formatCurrency(lucro)
        ];
      });

      autoTable(doc, {
        head: soldHeaders,
        body: soldData,
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [63, 81, 181] },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 
          0: { cellWidth: 60 },
          1: { cellWidth: 30 },
          2: { cellWidth: 30 },
          3: { cellWidth: 35 },
          4: { cellWidth: 30 },
          5: { cellWidth: 30 },
          6: { cellWidth: 30 }
        }
      });

      // Salvar o PDF
      doc.save('relatorio-veiculos.pdf');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold">Relatórios</h1>
        <button
          onClick={exportToPDF}
          className="w-full sm:w-auto bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
        >
          <span>Exportar PDF</span>
        </button>
      </div>

      <div className="mb-6 sm:mb-8">
        <div className="flex flex-nowrap overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 pb-2 sm:pb-0 border-b scrollbar-none">
          <button
            className={`py-2 px-3 sm:px-4 whitespace-nowrap text-sm sm:text-base ${activeTab === 'overview' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('overview')}
          >
            Visão Geral
          </button>
          <button
            className={`py-2 px-3 sm:px-4 whitespace-nowrap text-sm sm:text-base ${activeTab === 'price_analysis' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('price_analysis')}
          >
            Análise de Preços
          </button>
          <button
            className={`py-2 px-3 sm:px-4 whitespace-nowrap text-sm sm:text-base ${activeTab === 'acquired' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('acquired')}
          >
            Adquiridos
          </button>
          <button
            className={`py-2 px-3 sm:px-4 whitespace-nowrap text-sm sm:text-base ${activeTab === 'in_preparation' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('in_preparation')}
          >
            Em Preparação
          </button>
          <button
            className={`py-2 px-3 sm:px-4 whitespace-nowrap text-sm sm:text-base ${activeTab === 'for_sale' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('for_sale')}
          >
            À Venda
          </button>
          <button
            className={`py-2 px-3 sm:px-4 whitespace-nowrap text-sm sm:text-base ${activeTab === 'sold' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('sold')}
          >
            Vendidos
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Filtrar por Período</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={handleFilter}
                className="w-full sm:w-auto bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
              >
                Filtrar
              </button>
              <button
                onClick={clearFilter}
                className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
              >
                Limpar Filtro
              </button>
            </div>
            <div className="mt-3 text-xs sm:text-sm text-gray-600">
              {isFiltered ? (
                <p>
                  Mostrando dados de {new Date(startDate).toLocaleDateString('pt-BR')} até {new Date(endDate).toLocaleDateString('pt-BR')}
                </p>
              ) : (
                <p>Clique em Filtrar para aplicar o filtro de período</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Total de Veículos</h3>
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">{reportData.totalVehicles}</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Investimento Total</h3>
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">{formatCurrency(reportData.totalInvestment)}</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Total em Vendas</h3>
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">{formatCurrency(reportData.totalSales)}</p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Lucro Total</h3>
              <p className={`text-2xl sm:text-3xl font-bold ${reportData.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(reportData.totalProfit)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Despesas por Tipo</h2>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(reportData.expensesByType).map(([type, amount]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-gray-700 capitalize">{type}</span>
                  <span className="text-sm sm:text-base font-medium text-gray-900">{formatCurrency(amount)}</span>
                </div>
              ))}
              <div className="pt-3 sm:pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-semibold text-gray-900">Total de Despesas</span>
                  <span className="text-base sm:text-lg font-bold text-gray-900">
                    {formatCurrency(reportData.totalExpenses)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'price_analysis' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Análise de Lucro por Formato de Venda</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wholesale</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MMR</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retail</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repasse</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...reportData.vehiclesByStatus.acquired, ...reportData.vehiclesByStatus.in_preparation, ...reportData.vehiclesByStatus.for_sale].map((vehicle) => {
                    const totalCost = vehicle.purchasePrice + 
                      (vehicle.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0);
                    
                    const wholesaleProfit = vehicle.marketPrices ? vehicle.marketPrices.wholesale - totalCost : 0;
                    const mmrProfit = vehicle.marketPrices ? vehicle.marketPrices.mmr - totalCost : 0;
                    const retailProfit = vehicle.marketPrices ? vehicle.marketPrices.retail - totalCost : 0;
                    const repasseProfit = vehicle.marketPrices ? vehicle.marketPrices.repasse - totalCost : 0;

                    const wholesaleMargin = calculateProfitMargin(vehicle.marketPrices?.wholesale || 0, totalCost);
                    const mmrMargin = calculateProfitMargin(vehicle.marketPrices?.mmr || 0, totalCost);
                    const retailMargin = calculateProfitMargin(vehicle.marketPrices?.retail || 0, totalCost);
                    const repasseMargin = calculateProfitMargin(vehicle.marketPrices?.repasse || 0, totalCost);

                    return (
                      <tr key={vehicle.id}>
                        <td className="px-6 py-4">
                          <Link 
                            href={`/protected/vehicles/${vehicle.id}`}
                            className="group"
                          >
                            <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                              {vehicle.brand} {vehicle.model} ({vehicle.year})
                            </div>
                            <div className="text-xs text-gray-500 group-hover:text-primary-500">
                              VIN: {vehicle.vin}
                            </div>
                            <div className="text-xs text-gray-500 group-hover:text-primary-500">
                              Cor: {vehicle.color}
                            </div>
                            <div className="text-xs text-primary-600 mt-1">
                              Clique para editar →
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div>Compra: {formatCurrency(vehicle.purchasePrice)}</div>
                            <div>Despesas: {formatCurrency(vehicle.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0)}</div>
                            <div className="font-semibold">Total: {formatCurrency(totalCost)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {vehicle.marketPrices ? (
                            <div className="text-sm">
                              <div>Preço: {formatCurrency(vehicle.marketPrices.wholesale)}</div>
                              <div className={`font-semibold ${wholesaleProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Lucro: {formatCurrency(wholesaleProfit)}
                              </div>
                              <div className={`text-xs ${wholesaleMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Margem: {wholesaleMargin.toFixed(1)}%
                              </div>
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {vehicle.marketPrices ? (
                            <div className="text-sm">
                              <div>Preço: {formatCurrency(vehicle.marketPrices.mmr)}</div>
                              <div className={`font-semibold ${mmrProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Lucro: {formatCurrency(mmrProfit)}
                              </div>
                              <div className={`text-xs ${mmrMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Margem: {mmrMargin.toFixed(1)}%
                              </div>
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {vehicle.marketPrices ? (
                            <div className="text-sm">
                              <div>Preço: {formatCurrency(vehicle.marketPrices.retail)}</div>
                              <div className={`font-semibold ${retailProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Lucro: {formatCurrency(retailProfit)}
                              </div>
                              <div className={`text-xs ${retailMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Margem: {retailMargin.toFixed(1)}%
                              </div>
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {vehicle.marketPrices ? (
                            <div className="text-sm">
                              <div>Preço: {formatCurrency(vehicle.marketPrices.repasse)}</div>
                              <div className={`font-semibold ${repasseProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Lucro: {formatCurrency(repasseProfit)}
                              </div>
                              <div className={`text-xs ${repasseMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Margem: {repasseMargin.toFixed(1)}%
                              </div>
                            </div>
                          ) : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(['wholesale', 'mmr', 'retail', 'repasse'] as Array<keyof MarketPrice>).map((format) => {
              const vehicles = [...reportData.vehiclesByStatus.acquired, ...reportData.vehiclesByStatus.in_preparation, ...reportData.vehiclesByStatus.for_sale];
              const validVehicles = vehicles.filter(v => v.marketPrices && v.marketPrices[format]);
              
              const totalProfit = validVehicles.reduce((sum, vehicle) => {
                const totalCost = vehicle.purchasePrice + 
                  (vehicle.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0);
                const price = vehicle.marketPrices?.[format] || 0;
                return sum + (price - totalCost);
              }, 0);

              const averageMargin = validVehicles.length > 0
                ? validVehicles.reduce((sum, vehicle) => {
                    const totalCost = vehicle.purchasePrice + 
                      (vehicle.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0);
                    const price = vehicle.marketPrices?.[format] || 0;
                    return sum + calculateProfitMargin(price, totalCost);
                  }, 0) / validVehicles.length
                : 0;

              return (
                <div key={format} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 capitalize">{format}</h3>
                  <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'} mb-1`}>
                    {formatCurrency(totalProfit)}
                  </div>
                  <div className={`text-sm ${averageMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Margem Média: {averageMargin.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {validVehicles.length} veículos
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'acquired' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Veículos Adquiridos ({reportData.vehiclesByStatus.acquired.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Aquisição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milhas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor de Compra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preços de Mercado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.vehiclesByStatus.acquired.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/protected/vehicles/${vehicle.id}`}
                        className="group"
                      >
                        <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                          {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-primary-500">
                          VIN: {vehicle.vin}
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-primary-500">
                          Cor: {vehicle.color}
                        </div>
                        <div className="text-xs text-primary-600 mt-1">
                          Clique para editar →
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(vehicle.purchaseDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {vehicle.mileage.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatCurrency(vehicle.purchasePrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {vehicle.marketPrices ? (
                        <ul className="list-disc list-inside">
                          <li>Wholesale: {formatCurrency(vehicle.marketPrices.wholesale)}</li>
                          <li>MMR: {formatCurrency(vehicle.marketPrices.mmr)}</li>
                          <li>Retail: {formatCurrency(vehicle.marketPrices.retail)}</li>
                          <li>Repasse: {formatCurrency(vehicle.marketPrices.repasse)}</li>
                        </ul>
                      ) : 'Não disponível'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'in_preparation' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Veículos em Preparação ({reportData.vehiclesByStatus.in_preparation.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Aquisição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milhas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor de Compra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Despesas</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.vehiclesByStatus.in_preparation.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/protected/vehicles/${vehicle.id}`}
                        className="group"
                      >
                        <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                          {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-primary-500">
                          VIN: {vehicle.vin}
                        </div>
                        <div className="text-xs text-gray-500 group-hover:text-primary-500">
                          Cor: {vehicle.color}
                        </div>
                        <div className="text-xs text-primary-600 mt-1">
                          Clique para editar →
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(vehicle.purchaseDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {vehicle.mileage.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatCurrency(vehicle.purchasePrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        {vehicle.expenses.map(exp => (
                          <p key={exp.id}>
                            {exp.type}: {formatCurrency(exp.amount)}
                          </p>
                        ))}
                        <p className="font-semibold mt-2">
                          Total: {formatCurrency(vehicle.expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'for_sale' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Veículos à Venda ({reportData.vehiclesByStatus.for_sale.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Aquisição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milhas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preços de Mercado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.vehiclesByStatus.for_sale.map((vehicle) => {
                  const totalCost = vehicle.purchasePrice + 
                    (vehicle.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0);
                  
                  return (
                    <tr key={vehicle.id}>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/protected/vehicles/${vehicle.id}`}
                          className="group"
                        >
                          <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </div>
                          <div className="text-xs text-gray-500 group-hover:text-primary-500">
                            VIN: {vehicle.vin}
                          </div>
                          <div className="text-xs text-gray-500 group-hover:text-primary-500">
                            Cor: {vehicle.color}
                          </div>
                          <div className="text-xs text-primary-600 mt-1">
                            Clique para editar →
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(vehicle.purchaseDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {vehicle.mileage.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          <p>Compra: {formatCurrency(vehicle.purchasePrice)}</p>
                          <p>Despesas: {formatCurrency(vehicle.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0)}</p>
                          <p className="font-semibold">Total: {formatCurrency(totalCost)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {vehicle.marketPrices ? (
                          <ul className="list-disc list-inside">
                            <li>Wholesale: {formatCurrency(vehicle.marketPrices.wholesale)}</li>
                            <li>MMR: {formatCurrency(vehicle.marketPrices.mmr)}</li>
                            <li>Retail: {formatCurrency(vehicle.marketPrices.retail)}</li>
                            <li>Repasse: {formatCurrency(vehicle.marketPrices.repasse)}</li>
                          </ul>
                        ) : 'Não disponível'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sold' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Veículos Vendidos ({reportData.vehiclesByStatus.sold.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Aquisição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data da Venda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.vehiclesByStatus.sold.map((vehicle) => {
                  const totalCost = vehicle.purchasePrice + 
                    (vehicle.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0);
                  const profit = (vehicle.saleInfo?.salePrice || 0) - totalCost;
                  
                  return (
                    <tr key={vehicle.id}>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/protected/vehicles/${vehicle.id}`}
                          className="group"
                        >
                          <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </div>
                          <div className="text-xs text-gray-500 group-hover:text-primary-500">
                            VIN: {vehicle.vin}
                          </div>
                          <div className="text-xs text-gray-500 group-hover:text-primary-500">
                            Cor: {vehicle.color}
                          </div>
                          <div className="text-xs text-primary-600 mt-1">
                            Clique para editar →
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(vehicle.purchaseDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {vehicle.saleInfo ? formatDate(vehicle.saleInfo.saleDate) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          <p>Compra: {formatCurrency(vehicle.purchasePrice)}</p>
                          <p>Despesas: {formatCurrency(vehicle.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0)}</p>
                          <p className="font-semibold">Total: {formatCurrency(totalCost)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {vehicle.saleInfo ? formatCurrency(vehicle.saleInfo.salePrice) : 'N/A'}
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(profit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 