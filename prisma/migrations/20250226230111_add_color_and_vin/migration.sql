/*
  Warnings:

  - A unique constraint covering the columns `[vin]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `color` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vin` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `vehicle` ADD COLUMN `color` VARCHAR(191) NOT NULL,
    ADD COLUMN `vin` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Vehicle_vin_key` ON `Vehicle`(`vin`);
