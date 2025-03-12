# Changelog

## [1.0.0] - 2024-03-13

### Adicionado
- Sistema de autenticação com diferentes níveis de acesso (admin e operador)
- Gestão completa de veículos (cadastro, edição, exclusão)
- Fluxo de status dos veículos (Adquirido -> Em Preparação -> Disponível para Venda -> Vendido)
- Gestão de despesas por veículo
- Upload e gerenciamento de imagens dos veículos
- Cadastro e gestão de clientes
- Vinculação de clientes a veículos de interesse
- Dashboard com métricas importantes:
  - Total de veículos por status
  - Investimento total
  - Receita total
  - Lucro total
  - Despesas totais
- Relatórios de vendas e desempenho
- Interface responsiva e moderna
- Integração com Cloudinary para armazenamento de imagens
- Banco de dados PostgreSQL com Prisma ORM
- Deploy automatizado com Vercel

### Segurança
- Proteção de rotas por autenticação
- Criptografia de senhas
- Variáveis de ambiente seguras
- Validações de entrada em todos os formulários

### Técnico
- Framework Next.js 14 com App Router
- TypeScript para maior segurança de tipos
- Tailwind CSS para estilização
- NextAuth.js para autenticação
- Prisma como ORM
- Cloudinary para armazenamento de imagens 