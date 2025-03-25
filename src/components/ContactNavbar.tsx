'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import LanguageSelector from './LanguageSelector';

export default function ContactNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { translations } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (sectionId: string) => {
    const navbarHeight = 80; // Altura do navbar em pixels

    if (sectionId === 'inicio') {
      router.push('/');
    } else {
      router.push('/');
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: sectionPosition - navbarHeight,
            behavior: 'smooth'
          });
        } else {
          setTimeout(() => {
            const retrySection = document.getElementById(sectionId);
            if (retrySection) {
              const retryPosition = retrySection.getBoundingClientRect().top + window.pageYOffset;
              window.scrollTo({
                top: retryPosition - navbarHeight,
                behavior: 'smooth'
              });
            }
          }, 500);
        }
      }, 300);
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo/logo-preto.png"
                alt="Loyal Auto Sales"
                width={120}
                height={40}
                className="h-auto w-auto"
                priority
              />
            </Link>
          </div>

          {/* Links de navegação - Desktop */}
          <div className="hidden md:flex items-center space-x-12">
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => handleNavigation('inicio')}
                className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
              >
                {translations.navbar.home}
              </button>
              <button 
                onClick={() => handleNavigation('historia')}
                className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
              >
                {translations.navbar.history}
              </button>
              <button 
                onClick={() => handleNavigation('valores')}
                className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
              >
                {translations.navbar.values}
              </button>
              <button 
                onClick={() => handleNavigation('veiculos-destaque')}
                className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors"
              >
                {translations.navbar.featuredVehicles}
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Link 
                href="/contact" 
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                {translations.navbar.contact}
              </Link>
              <Link 
                href="/login" 
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors text-lg font-medium"
              >
                {translations.navbar.employers}
              </Link>
            </div>
          </div>

          {/* Botão do menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-900"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-white rounded-lg mt-2 p-4">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => handleNavigation('inicio')}
                className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors text-left"
              >
                {translations.navbar.home}
              </button>
              <button
                onClick={() => handleNavigation('historia')}
                className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors text-left"
              >
                {translations.navbar.history}
              </button>
              <button
                onClick={() => handleNavigation('valores')}
                className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors text-left"
              >
                {translations.navbar.values}
              </button>
              <button
                onClick={() => handleNavigation('veiculos-destaque')}
                className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors text-left"
              >
                {translations.navbar.featuredVehicles}
              </button>
              <div className="flex justify-center py-2">
                <LanguageSelector />
              </div>
              <Link
                href="/contact"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors text-lg font-medium text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {translations.navbar.contact}
              </Link>
              <Link
                href="/login"
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors text-lg font-medium text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {translations.navbar.employers}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 