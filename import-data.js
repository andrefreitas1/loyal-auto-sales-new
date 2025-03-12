const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;

async function importData() {
  const prisma = new PrismaClient();

  try {
    console.log('Importando dados...');

    // Importar usuários
    const users = JSON.parse(await fs.readFile('users.json', 'utf8'));
    for (const user of users) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          active: Boolean(user.active),
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
    }
    console.log(`Importados ${users.length} usuários`);

    // Importar veículos
    const vehicles = JSON.parse(await fs.readFile('vehicles.json', 'utf8'));
    for (const vehicle of vehicles) {
      await prisma.vehicle.create({
        data: {
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color,
          vin: vehicle.vin,
          mileage: Number(vehicle.mileage),
          purchasePrice: Number(vehicle.purchasePrice),
          purchaseDate: new Date(vehicle.purchaseDate),
          status: vehicle.status,
          createdAt: new Date(vehicle.createdAt),
          updatedAt: new Date(vehicle.updatedAt)
        }
      });
    }
    console.log(`Importados ${vehicles.length} veículos`);

    // Importar imagens
    const images = JSON.parse(await fs.readFile('images.json', 'utf8'));
    for (const image of images) {
      await prisma.image.create({
        data: {
          id: image.id,
          url: image.url,
          vehicleId: image.vehicleId,
          createdAt: new Date(image.createdAt)
        }
      });
    }
    console.log(`Importadas ${images.length} imagens`);

    // Importar despesas
    const expenses = JSON.parse(await fs.readFile('expenses.json', 'utf8'));
    for (const expense of expenses) {
      await prisma.expense.create({
        data: {
          id: expense.id,
          type: expense.type,
          description: expense.description,
          amount: Number(expense.amount),
          date: new Date(expense.date),
          vehicleId: expense.vehicleId,
          createdAt: new Date(expense.createdAt)
        }
      });
    }
    console.log(`Importadas ${expenses.length} despesas`);

    // Importar preços de mercado
    const marketPrices = JSON.parse(await fs.readFile('market-prices.json', 'utf8'));
    for (const price of marketPrices) {
      await prisma.marketPrice.create({
        data: {
          id: price.id,
          wholesale: Number(price.wholesale),
          mmr: Number(price.mmr),
          retail: Number(price.retail),
          repasse: Number(price.repasse),
          vehicleId: price.vehicleId,
          createdAt: new Date(price.createdAt),
          updatedAt: new Date(price.updatedAt)
        }
      });
    }
    console.log(`Importados ${marketPrices.length} preços de mercado`);

    // Importar informações de venda
    const saleInfo = JSON.parse(await fs.readFile('sale-info.json', 'utf8'));
    for (const sale of saleInfo) {
      await prisma.saleInfo.create({
        data: {
          id: sale.id,
          salePrice: Number(sale.salePrice),
          saleDate: new Date(sale.saleDate),
          vehicleId: sale.vehicleId,
          createdAt: new Date(sale.createdAt)
        }
      });
    }
    console.log(`Importadas ${saleInfo.length} informações de venda`);

    console.log('Importação concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao importar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData(); 