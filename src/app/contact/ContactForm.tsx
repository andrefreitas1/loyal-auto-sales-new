'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VehicleSelect from '@/components/VehicleSelect';
import { useLanguage } from '@/hooks/useLanguage';

export default function ContactForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { translations } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    vehicleId: searchParams.get('vehicleId') || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          vehicleId: formData.vehicleId || null
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        vehicleId: ''
      });
    } catch (err) {
      setError('Erro ao enviar mensagem. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
          {translations.contact.form.success}
        </div>
      )}

      <div>
        <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-200 mb-1">
          {translations.contact.form.vehicleInterest}
        </label>
        <VehicleSelect
          value={formData.vehicleId}
          onChange={(value) => setFormData(prev => ({ ...prev, vehicleId: value }))}
          required
        />
      </div>

      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-1">
          {translations.contact.form.firstName}
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full px-3 py-2.5 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white"
          required
        />
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-1">
          {translations.contact.form.lastName}
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full px-3 py-2.5 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
          {translations.contact.form.email}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2.5 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white"
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-1">
          {translations.contact.form.phone}
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2.5 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white"
          required
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? translations.contact.form.sending : translations.contact.form.submit}
        </button>
      </div>
    </form>
  );
} 