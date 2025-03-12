# Loyal Auto Sales - Sistema de Gestão

Sistema de gestão de veículos desenvolvido para a Loyal Auto Sales, especializada em compra e venda de veículos em Orlando, Florida.

## ⚠️ Importante

Esta aplicação utiliza **EXCLUSIVAMENTE** PostgreSQL como banco de dados. Para mais informações sobre o banco de dados, backups e migrações, consulte o arquivo [DATABASE.md](DATABASE.md).

## Funcionalidades

### Gestão de Veículos
- Cadastro completo de veículos com código único
- Upload e gerenciamento de múltiplas imagens para cada veículo
- Registro de informações detalhadas (marca, modelo, ano, cor, quilometragem, VIN)
- Controle de status do veículo (Adquirido, Em Preparação, À Venda, Vendido)
- Histórico completo de cada veículo

### Gestão Financeira
- Registro de preço de compra
- Controle detalhado de despesas por tipo:
  - Manutenção
  - Combustível
  - Lavagem
  - Outros custos
- Consulta de preços de mercado em tempo real:
  - Wholesale
  - MMR (Manheim Market Report)
  - Retail
  - Repasse
- Registro de vendas com preço e data
- Cálculo automático de lucro/prejuízo por veículo

### Relatórios e Análises
- Dashboard com visão geral do negócio
- Relatórios detalhados em PDF
- Análise de lucro por formato de venda
- Filtros por período para análise financeira
- Estatísticas de performance
- Métricas de margem de lucro por tipo de venda

### Gestão de Usuários
- Sistema de autenticação seguro
- Gerenciamento de usuários com diferentes níveis de acesso
- Proteção de rotas por autenticação
- Histórico de ações por usuário

### Interface e Usabilidade
- Design responsivo e moderno
- Navegação intuitiva por status do veículo
- Filtros e buscas avançadas
- Interface otimizada para dispositivos móveis
- Tema personalizado com cores da empresa

## Requisitos

- Node.js 18.0 ou superior
- PostgreSQL 15.0 ou superior
- NPM ou Yarn

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd loyal_auto_sales
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure o banco de dados:
- Crie um banco de dados PostgreSQL chamado `loyal_auto_sales`
- Copie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente:
  - DATABASE_URL
  - NEXTAUTH_SECRET
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET
- Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

5. Acesse o sistema em `http://localhost:3000`

## Estrutura do Projeto

- `/src/app` - Páginas e componentes da aplicação
  - `/(auth)` - Páginas relacionadas à autenticação
  - `/(protected)` - Páginas protegidas que requerem login
  - `/api` - Rotas da API
- `/src/components` - Componentes reutilizáveis
- `/src/lib` - Configurações e utilitários
- `/prisma` - Modelos e migrações do banco de dados
- `/public` - Arquivos estáticos

## Tecnologias Utilizadas

- Next.js 14 com App Router
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Neon)
- NextAuth.js para autenticação
- Cloudinary para armazenamento de imagens
- jsPDF para geração de relatórios
- UUID para códigos únicos
- React Dropzone para upload de imagens
- React Hook Form para formulários
- Zod para validação de dados

## Segurança

- Autenticação via NextAuth.js
- Proteção de rotas por middleware
- Validação de dados com Zod
- Upload seguro de imagens via Cloudinary
- Sanitização de inputs
- Proteção contra CSRF

## Documentação

- [Banco de Dados](DATABASE.md)
- [API Routes](API.md)
- [Autenticação](AUTH.md) 