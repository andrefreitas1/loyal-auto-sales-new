const { PrismaClient } = require('@prisma/client');

// Cliente Prisma para o banco local
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://root:root@localhost:3306/loyal_auto_sales'
    }
  }
});

// Cliente Prisma para o banco online
const remotePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.REMOTE_DATABASE_URL
    }
  }
});

async function migratePrismaData() {
  try {
    console.log('Iniciando migração do banco de dados...');

    // 1. Migrar usuários
    console.log('\nMigrando usuários...');
    const users = await localPrisma.user.findMany();
    console.log(`- ${users.length} usuários encontrados`);

    for (const user of users) {
      try {
        await remotePrisma.user.create({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        });
        process.stdout.write('.');
      } catch (err) {
        console.error(`\nErro ao migrar usuário ${user.email}:`, err.message);
      }
    }

    // 2. Migrar veículos e dados relacionados
    console.log('\n\nMigrando veículos e dados relacionados...');
    const vehicles = await localPrisma.vehicle.findMany({
      include: {
        images: true,
        expenses: true,
        marketPrices: true,
        saleInfo: true
      }
    });
    console.log(`- ${vehicles.length} veículos encontrados`);

    for (const vehicle of vehicles) {
      try {
        // Criar veículo
        await remotePrisma.vehicle.create({
          data: {
            id: vehicle.id,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            vin: vehicle.vin,
            mileage: vehicle.mileage,
            purchasePrice: vehicle.purchasePrice,
            purchaseDate: vehicle.purchaseDate,
            status: vehicle.status,
            createdAt: vehicle.createdAt,
            updatedAt: vehicle.updatedAt,
            // Criar imagens relacionadas
            images: {
              create: vehicle.images.map(img => ({
                id: img.id,
                url: img.url,
                createdAt: img.createdAt
              }))
            },
            // Criar despesas relacionadas
            expenses: {
              create: vehicle.expenses.map(exp => ({
                id: exp.id,
                type: exp.type,
                description: exp.description,
                amount: exp.amount,
                date: exp.date,
                createdAt: exp.createdAt
              }))
            },
            // Criar preços de mercado se existirem
            ...(vehicle.marketPrices && {
              marketPrices: {
                create: {
                  id: vehicle.marketPrices.id,
                  wholesale: vehicle.marketPrices.wholesale,
                  mmr: vehicle.marketPrices.mmr,
                  retail: vehicle.marketPrices.retail,
                  repasse: vehicle.marketPrices.repasse,
                  createdAt: vehicle.marketPrices.createdAt,
                  updatedAt: vehicle.marketPrices.updatedAt
                }
              }
            }),
            // Criar informações de venda se existirem
            ...(vehicle.saleInfo && {
              saleInfo: {
                create: {
                  id: vehicle.saleInfo.id,
                  salePrice: vehicle.saleInfo.salePrice,
                  saleDate: vehicle.saleInfo.saleDate,
                  createdAt: vehicle.saleInfo.createdAt
                }
              }
            })
          }
        });
        console.log(`\n- Veículo migrado com sucesso: ${vehicle.brand} ${vehicle.model}`);
      } catch (err) {
        console.error(`\nErro ao migrar veículo ${vehicle.brand} ${vehicle.model}:`, err.message);
      }
    }

    console.log('\nMigração concluída com sucesso!');

  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
  }
}

migratePrismaData(); 