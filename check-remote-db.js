const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://telewayc_loyal_auto_sales:34aNDcv3LGlc@51.91.51.137:3306/telewayc_loyal_auto_sales'
    }
  }
});

async function checkDatabase() {
  try {
    console.log('Verificando banco de dados remoto...\n');

    // Verificar usuários
    const users = await prisma.user.findMany();
    console.log('Usuários encontrados:', users.length);
    if (users.length > 0) {
      console.log('\nLista de usuários:');
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    // Verificar veículos
    const vehicles = await prisma.vehicle.findMany({
      include: {
        images: true,
        expenses: true,
        marketPrices: true,
        saleInfo: true
      }
    });
    console.log('\nVeículos encontrados:', vehicles.length);
    if (vehicles.length > 0) {
      console.log('Exemplo de veículo:', {
        brand: vehicles[0].brand,
        model: vehicles[0].model,
        year: vehicles[0].year,
        status: vehicles[0].status,
        images: vehicles[0].images.length,
        expenses: vehicles[0].expenses.length,
        hasMarketPrices: !!vehicles[0].marketPrices,
        hasSaleInfo: !!vehicles[0].saleInfo
      });
    }

  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 