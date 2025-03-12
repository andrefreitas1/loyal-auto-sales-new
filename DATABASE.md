# Configuração do Banco de Dados

## Importante: PostgreSQL Only!

Esta aplicação foi projetada para funcionar **EXCLUSIVAMENTE** com PostgreSQL hospedado na plataforma Neon. 

⚠️ **ATENÇÃO**: Não tente migrar para outros bancos de dados (MySQL, SQLite, etc.) pois isso causará perda de dados!

## Banco de Dados

- **Provedor**: Neon (https://neon.tech)
- **Tipo**: PostgreSQL
- **ORM**: Prisma

## Backups e Migrações

### Backups

Sempre que for necessário fazer um backup:
1. Use SOMENTE as ferramentas de backup do PostgreSQL
2. O formato do backup deve ser compatível com PostgreSQL
3. Recomendamos usar o pg_dump para backups:
   ```bash
   pg_dump -h [HOST] -U [USER] -d [DATABASE] -F c -b -v -f backup.sql
   ```

### Novas Tabelas/Migrações

Ao adicionar novas tabelas ou fazer alterações no schema:
1. Sempre faça um backup antes
2. Use o Prisma para gerenciar as migrações:
   ```bash
   npx prisma migrate dev --name [nome_da_migracao]
   ```
3. Nunca use o comando `prisma migrate reset` em produção sem um backup

## Restauração

Para restaurar um backup:
1. Use o pg_restore para PostgreSQL:
   ```bash
   pg_restore -h [HOST] -U [USER] -d [DATABASE] backup.sql
   ```
2. Verifique se todas as relações foram restauradas corretamente

## Variáveis de Ambiente

As seguintes variáveis de ambiente são necessárias:
```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]"
DIRECT_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]"
```

## Troubleshooting

Se encontrar o erro "Provider mismatch":
1. NÃO execute `prisma migrate reset`
2. Faça backup dos dados primeiro
3. Entre em contato com o administrador do sistema

## Contato

Em caso de dúvidas sobre o banco de dados ou necessidade de suporte, entre em contato com a equipe de desenvolvimento. 