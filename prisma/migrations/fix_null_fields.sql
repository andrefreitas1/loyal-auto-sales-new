-- Atualizar registros existentes com valores padrão para campos que não podem ser nulos
UPDATE "Customer"
SET
  "address" = COALESCE("address", ''),
  "city" = COALESCE("city", ''),
  "state" = COALESCE("state", ''),
  "zipCode" = COALESCE("zipCode", ''),
  "profession" = COALESCE("profession", ''),
  "monthlyIncome" = COALESCE("monthlyIncome", 0),
  "residenceYears" = COALESCE("residenceYears", 0),
  "residenceMonths" = COALESCE("residenceMonths", 0),
  "jobYears" = COALESCE("jobYears", 0),
  "jobMonths" = COALESCE("jobMonths", 0),
  "residenceType" = COALESCE("residenceType", 'RENTAL');

-- Garantir que as colunas não aceitem valores nulos
ALTER TABLE "Customer"
  ALTER COLUMN "address" SET NOT NULL,
  ALTER COLUMN "city" SET NOT NULL,
  ALTER COLUMN "state" SET NOT NULL,
  ALTER COLUMN "zipCode" SET NOT NULL,
  ALTER COLUMN "profession" SET NOT NULL,
  ALTER COLUMN "monthlyIncome" SET NOT NULL,
  ALTER COLUMN "residenceYears" SET NOT NULL,
  ALTER COLUMN "residenceMonths" SET NOT NULL,
  ALTER COLUMN "jobYears" SET NOT NULL,
  ALTER COLUMN "jobMonths" SET NOT NULL,
  ALTER COLUMN "residenceType" SET NOT NULL; 