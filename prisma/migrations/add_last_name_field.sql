-- Adiciona a coluna lastName
ALTER TABLE "Customer" ADD COLUMN "lastName" TEXT;

-- Atualiza os registros existentes copiando o valor de firstName (temporariamente)
UPDATE "Customer" SET "lastName" = "firstName" WHERE "lastName" IS NULL;

-- Torna a coluna lastName obrigatória
ALTER TABLE "Customer" ALTER COLUMN "lastName" SET NOT NULL; 