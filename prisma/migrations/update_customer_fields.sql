-- Criar o tipo enum para ResidenceType
CREATE TYPE "ResidenceType" AS ENUM ('RENTAL', 'MORTGAGE', 'OWNED');

-- Adicionar campos faltantes com valores default
ALTER TABLE "Customer" 
  ADD COLUMN IF NOT EXISTS "address" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "city" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "state" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "zipCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "profession" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "monthlyIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "residenceYears" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "residenceMonths" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "jobYears" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "jobMonths" INTEGER NOT NULL DEFAULT 0;

-- Adicionar coluna temporária para residenceType
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "residenceType" "ResidenceType" NOT NULL DEFAULT 'RENTAL';

-- Converter dados existentes de isRental para residenceType
UPDATE "Customer" 
SET "residenceType" = CASE 
  WHEN "isRental" = true THEN 'RENTAL'::ResidenceType 
  ELSE 'MORTGAGE'::ResidenceType 
END
WHERE "isRental" IS NOT NULL;

-- Remover coluna antiga isRental
ALTER TABLE "Customer" DROP COLUMN IF EXISTS "isRental"; 