-- Adiciona a coluna description de forma segura
ALTER TABLE "Vehicle" ADD COLUMN IF NOT EXISTS "description" TEXT; 