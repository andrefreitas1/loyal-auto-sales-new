import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import InstitutionalContent from './InstitutionalContent';
import InstitutionalNavbar from '@/components/InstitutionalNavbar';
import ImageCarousel from '../../components/ImageCarousel';

export const metadata: Metadata = {
  title: 'Sobre Nós | Loyal Auto Sales',
  description: 'Conheça a história da Loyal Auto Sales e nossa missão de oferecer os melhores veículos para nossos clientes.',
};

export default async function InstitutionalPage() {
  // Busca todos os veículos à venda
  const featuredVehicles = await prisma.vehicle.findMany({
    where: {
      status: 'for_sale',
    },
    include: {
      images: true,
      marketPrices: true,
    },
  });

  // Busca todos os veículos à venda para o carrossel
  const allVehicles = await prisma.vehicle.findMany({
    where: {
      status: 'for_sale',
      images: {
        some: {} // Garante que o veículo tenha pelo menos uma imagem
      }
    },
    include: {
      images: {
        take: 1 // Pega apenas a primeira imagem de cada veículo
      }
    },
  });

  // Prepara as imagens para o carrossel
  const carouselImages = allVehicles.map(vehicle => ({
    url: vehicle.images[0].url,
    alt: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    vehicleId: vehicle.id
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <InstitutionalNavbar />
      <div className="relative isolate pt-16">
        {/* Background pattern */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-primary-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Seção Início */}
          <div id="inicio" className="relative min-h-screen">
            {/* Carrossel de Imagens */}
            <div className="absolute inset-0 w-full h-full">
              <ImageCarousel images={carouselImages} />
            </div>

            {/* Conteúdo sobreposto */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen bg-black/40">
              <div className="text-center w-full max-w-4xl px-4">
                <h1 className="text-5xl font-bold text-white mb-8">Bem-vindo à Loyal Auto Sales</h1>
                <p className="text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed mb-12">
                  Na Loyal Auto Sales, transformamos o sonho de ter um carro nos Estados Unidos em realidade. 
                  Com anos de experiência no mercado americano, oferecemos um serviço personalizado e transparente, 
                  garantindo a melhor experiência para nossa comunidade latino-americana.
                </p>
                <div className="flex justify-center gap-6">
                  <a href="#historia" className="bg-primary-600 text-white px-8 py-4 rounded-md hover:bg-primary-700 transition-colors text-lg font-semibold">
                    Conheça Nossa História
                  </a>
                  <a href="#valores" className="bg-gray-800 text-white px-8 py-4 rounded-md hover:bg-gray-700 transition-colors text-lg font-semibold">
                    Nossos Valores
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Nossa História */}
          <div id="historia" className="py-24">
            <div className="bg-white/5 rounded-2xl p-8 ring-1 ring-white/10">
              <h2 className="text-3xl font-bold text-white mb-6">Nossa História</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg mb-4">
                  A Loyal Auto Sales nasceu da paixão por carros e do desejo de ajudar o público Latino-Americano a realizarem o sonho de ter um veículo nos Estados Unidos. 
                  Nossa jornada começou com uma visão clara: oferecer um serviço transparente, confiável e personalizado.
                </p>
                <p className="text-gray-300 text-lg mb-4">
                  Ao longo dos anos, construímos uma reputação sólida baseada na confiança e no compromisso com nossos clientes. 
                  Nossa experiência no mercado americano nos permite oferecer as melhores opções de financiamento e veículos.
                </p>
                <p className="text-gray-300 text-lg">
                  Hoje, a Loyal Auto Sales é uma empresa consolidada que continua crescendo e evoluindo, sempre mantendo 
                  nossos valores fundamentais e o compromisso com a excelência em tudo que fazemos.
                </p>
              </div>
            </div>
          </div>

          {/* Seção Valores e Carros à Venda */}
          <div id="valores" className="py-24">
            <InstitutionalContent vehicles={featuredVehicles} />
          </div>
        </div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-200 to-primary-400 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </div>
  );
} 