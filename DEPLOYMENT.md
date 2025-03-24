# Instruções de Deploy

## Deploy Automático

A Vercel detectará automaticamente as novas dependências (`@headlessui/react` e `@heroicons/react`) do `package.json` e as instalará durante o processo de build.

## Verificação do Deploy

Após o deploy, verifique se:
1. O dropdown de seleção de veículos está funcionando corretamente
2. As imagens dos veículos estão sendo exibidas
3. O formulário de contato está enviando os dados corretamente
4. O redirecionamento após o envio do formulário está funcionando

## Solução de Problemas

Se encontrar algum erro relacionado às novas dependências:
1. Verifique se as dependências foram adicionadas ao `package.json`
2. Limpe o cache da Vercel:
   ```bash
   vercel deploy --force
   ```
3. Verifique os logs de build na Vercel para identificar possíveis erros 