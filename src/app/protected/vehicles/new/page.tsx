'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';

interface FormData {
  brand: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  mileage: number;
  purchasePrice: number;
  purchaseDate: string;
  description: string;
  images: File[];
  marketPrices: {
    wholesale: number;
    mmr: number;
    retail: number;
    repasse: number;
  };
}

export default function NewVehicle() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    vin: '',
    mileage: 0,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    description: '',
    images: [],
    marketPrices: {
      wholesale: 0,
      mmr: 0,
      retail: 0,
      repasse: 0
    }
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    onDrop: (acceptedFiles) => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...acceptedFiles]
      }));
    }
  });

  const validateVIN = (vin: string) => {
    // Remover espaços e converter para maiúsculas
    const cleanVIN = vin.replace(/\s/g, '').toUpperCase();
    // VIN deve ter exatamente 17 caracteres e conter apenas letras e números
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVIN);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.brand.trim()) {
      setError('A marca do veículo é obrigatória');
      return;
    }

    if (!formData.model.trim()) {
      setError('O modelo do veículo é obrigatório');
      return;
    }

    if (!formData.color.trim()) {
      setError('A cor do veículo é obrigatória');
      return;
    }

    if (!validateVIN(formData.vin)) {
      setError('VIN inválido. Deve conter 17 caracteres alfanuméricos');
      return;
    }

    if (formData.mileage < 0) {
      setError('As milhas não podem ser negativas');
      return;
    }

    if (formData.purchasePrice <= 0) {
      setError('O preço de compra deve ser maior que zero');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('brand', formData.brand.trim());
      formDataToSend.append('model', formData.model.trim());
      formDataToSend.append('year', formData.year.toString());
      formDataToSend.append('color', formData.color.trim());
      formDataToSend.append('vin', formData.vin.trim().toUpperCase());
      formDataToSend.append('mileage', formData.mileage.toString());
      formDataToSend.append('purchasePrice', formData.purchasePrice.toString());
      formDataToSend.append('purchaseDate', formData.purchaseDate);
      formDataToSend.append('wholesale', formData.marketPrices.wholesale.toString());
      formDataToSend.append('mmr', formData.marketPrices.mmr.toString());
      formDataToSend.append('retail', formData.marketPrices.retail.toString());
      formDataToSend.append('repasse', formData.marketPrices.repasse.toString());
      formDataToSend.append('description', formData.description);
      
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao cadastrar veículo');
      }

      router.push('/protected/vehicles');
    } catch (error) {
      console.error('Erro ao cadastrar veículo:', error);
      setError(error instanceof Error ? error.message : 'Erro ao cadastrar veículo');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      description: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cadastrar Novo Veículo</h1>
          <p className="text-gray-600 mb-8">Preencha os dados do veículo para cadastrá-lo no sistema</p>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                <p className="font-medium">Erro no cadastro</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VIN
                  </label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                    maxLength={17}
                    minLength={17}
                    placeholder="Ex: 1HGCM82633A123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Aquisição
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Odômetro (mi)
                  </label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseFloat(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor de Compra ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value || '0') }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Preços de Mercado</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wholesale ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.marketPrices.wholesale}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      marketPrices: {
                        ...prev.marketPrices,
                        wholesale: parseFloat(e.target.value || '0')
                      }
                    }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MMR ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.marketPrices.mmr}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      marketPrices: {
                        ...prev.marketPrices,
                        mmr: parseFloat(e.target.value || '0')
                      }
                    }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retail ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.marketPrices.retail}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      marketPrices: {
                        ...prev.marketPrices,
                        retail: parseFloat(e.target.value || '0')
                      }
                    }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repasse ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.marketPrices.repasse}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      marketPrices: {
                        ...prev.marketPrices,
                        repasse: parseFloat(e.target.value || '0')
                      }
                    }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição do Veículo
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Insira uma descrição detalhada do veículo..."
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagens do Veículo
              </label>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
              >
                <input {...getInputProps()} />
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-gray-600">Arraste e solte imagens aqui, ou clique para selecionar</p>
                  <p className="text-sm text-gray-500">PNG, JPG, JPEG até 10MB</p>
                </div>
              </div>
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index)
                        }))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              >
                Cadastrar Veículo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 