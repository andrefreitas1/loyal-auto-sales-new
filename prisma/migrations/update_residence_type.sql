-- Criar o tipo enum para ResidenceType
DO $$ BEGIN
    CREATE TYPE "ResidenceType" AS ENUM ('RENTAL', 'MORTGAGE', 'OWNED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar coluna temporária para residenceType
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "residenceType" TEXT NOT NULL DEFAULT 'RENTAL';

-- Converter dados existentes de isRental para residenceType
UPDATE "Customer" 
SET "residenceType" = CASE 
  WHEN "isRental" = true THEN 'RENTAL'
  ELSE 'MORTGAGE'
END
WHERE "isRental" IS NOT NULL;

-- Remover coluna antiga isRental
ALTER TABLE "Customer" DROP COLUMN IF EXISTS "isRental"; 