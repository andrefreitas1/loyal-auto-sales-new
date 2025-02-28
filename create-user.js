const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function createOrUpdateUser() {
  try {
    const hashedPassword = await bcrypt.hash('32244000', 10);
    const email = 'andre@loyal.com';

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Atualizar a senha do usuário existente
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'admin'
        }
      });
      console.log('Usuário atualizado com sucesso:', updatedUser);
    } else {
      // Criar novo usuário
      const newUser = await prisma.user.create({
        data: {
          id: uuidv4(),
          name: 'Andre',
          email,
          password: hashedPassword,
          role: 'admin'
        }
      });
      console.log('Usuário criado com sucesso:', newUser);
    }
  } catch (error) {
    console.error('Erro ao criar/atualizar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOrUpdateUser(); 