'use client';

import { Vehicle } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

interface InstitutionalContentProps {
  vehicles: (Vehicle & {
    images: {
      id: string;
      url: string;
    }[];
    marketPrices: {
      retail: number;
    } | null;
  })[];
}

export default function InstitutionalContent({ vehicles }: InstitutionalContentProps) {
  return (
    <div className="space-y-16">
      {/* Valores */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-8">Nossos Valores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Transparência',
              description: 'Agimos com honestidade e clareza em todas as nossas operações, garantindo que você tenha todas as informações necessárias para tomar a melhor decisão.',
              icon: '🤝'
            },
            {
              title: 'Confiança',
              description: 'Construímos relacionamentos duradouros baseados na confiança mútua, estabelecendo uma parceria sólida com nossos clientes.',
              icon: '💎'
            },
            {
              title: 'Excelência',
              description: 'Buscamos a excelência em cada detalhe do nosso serviço, desde a seleção dos veículos até o atendimento ao cliente.',
              icon: '⭐'
            },
            {
              title: 'Compromisso',
              description: 'Nos comprometemos com o sucesso de nossos clientes, oferecendo suporte completo em toda a jornada de compra.',
              icon: '🎯'
            },
            {
              title: 'Inovação',
              description: 'Sempre buscamos as melhores soluções para nossos clientes, utilizando tecnologia e processos modernos.',
              icon: '💡'
            },
            {
              title: 'Respeito',
              description: 'Tratamos cada cliente com respeito e atenção individual, valorizando a diversidade e as necessidades específicas.',
              icon: '❤️'
            }
          ].map((valor, index) => (
            <div key={index} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-primary-500 transition-colors">
              <div className="text-4xl mb-4">{valor.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{valor.title}</h3>
              <p className="text-gray-300 leading-relaxed">{valor.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Carros à Venda */}
      <section id="veiculos">
        <h2 className="text-3xl font-bold text-white mb-8">Veículos em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden hover:border-primary-500 transition-colors">
              {vehicle.images[0] && (
                <div className="relative h-48">
                  <Image
                    src={vehicle.images[0].url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">{vehicle.brand} {vehicle.model}</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-300">Ano: {vehicle.year}</p>
                  <p className="text-gray-300">Cor: {vehicle.color}</p>
                  <p className="text-gray-300">Milhagem: {vehicle.mileage.toLocaleString()} mi</p>
                </div>
                
                {vehicle.marketPrices?.retail && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-400">Preço</p>
                    <p className="text-2xl font-bold text-primary-400">
                      ${vehicle.marketPrices.retail.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                  </div>
                )}

                <Link 
                  href={`/contact?vehicleId=${vehicle.id}`}
                  className="block w-full text-center bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Contate-nos agora
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 