-- Backup do banco de dados loyal_auto_sales

-- Desabilitar verificações de chave estrangeira
SET FOREIGN_KEY_CHECKS=0;

-- Limpar tabelas existentes
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS `Vehicle`;
DROP TABLE IF EXISTS `Image`;
DROP TABLE IF EXISTS `Expense`;
DROP TABLE IF EXISTS `MarketPrice`;
DROP TABLE IF EXISTS `SaleInfo`;

-- Criar tabelas
CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'operator',
  `active` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `User_email_key`(`email`),
  PRIMARY KEY (`id`)
);

CREATE TABLE `Vehicle` (
  `id` VARCHAR(191) NOT NULL,
  `brand` VARCHAR(191) NOT NULL,
  `model` VARCHAR(191) NOT NULL,
  `year` INTEGER NOT NULL,
  `color` VARCHAR(191) NOT NULL,
  `vin` VARCHAR(191) NOT NULL,
  `mileage` DOUBLE NOT NULL,
  `purchasePrice` DOUBLE NOT NULL,
  `purchaseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` VARCHAR(191) NOT NULL DEFAULT 'acquired',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `Vehicle_vin_key`(`vin`),
  PRIMARY KEY (`id`)
);

CREATE TABLE `Image` (
  `id` VARCHAR(191) NOT NULL,
  `url` VARCHAR(191) NOT NULL,
  `vehicleId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE
);

CREATE TABLE `Expense` (
  `id` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `vehicleId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE
);

CREATE TABLE `MarketPrice` (
  `id` VARCHAR(191) NOT NULL,
  `wholesale` DOUBLE NOT NULL,
  `mmr` DOUBLE NOT NULL,
  `retail` DOUBLE NOT NULL,
  `repasse` DOUBLE NOT NULL,
  `vehicleId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `MarketPrice_vehicleId_key`(`vehicleId`),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE
);

CREATE TABLE `SaleInfo` (
  `id` VARCHAR(191) NOT NULL,
  `salePrice` DOUBLE NOT NULL,
  `saleDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `vehicleId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `SaleInfo_vehicleId_key`(`vehicleId`),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE
);

-- Habilitar verificações de chave estrangeira
SET FOREIGN_KEY_CHECKS=1;

-- Inserir dados do banco local
INSERT INTO User SELECT * FROM loyal_auto_sales.User;
INSERT INTO Vehicle SELECT * FROM loyal_auto_sales.Vehicle;
INSERT INTO Image SELECT * FROM loyal_auto_sales.Image;
INSERT INTO Expense SELECT * FROM loyal_auto_sales.Expense;
INSERT INTO MarketPrice SELECT * FROM loyal_auto_sales.MarketPrice;
INSERT INTO SaleInfo SELECT * FROM loyal_auto_sales.SaleInfo; 