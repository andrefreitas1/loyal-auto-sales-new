const { PrismaClient } = require('@prisma/client');

async function testPrisma() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Tentando conectar usando Prisma...');
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Query executada com sucesso:', result);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro ao conectar com Prisma:', error);
  }
}

testPrisma(); 