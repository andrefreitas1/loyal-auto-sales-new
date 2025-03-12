const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Verificando banco de dados local...\n');

    // Verificar usuários
    const users = await prisma.user.findMany();
    console.log('Usuários encontrados:', users.length);
    if (users.length > 0) {
      console.log('Exemplo de usuário:', {
        name: users[0].name,
        email: users[0].email,
        role: users[0].role
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
        images: vehicles[0].images.length,
        expenses: vehicles[0].expenses.length
      });
    }

  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 