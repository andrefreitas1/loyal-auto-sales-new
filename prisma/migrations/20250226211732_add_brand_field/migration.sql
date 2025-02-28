/*
  Warnings:

  - Added the required column `brand` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `vehicle` ADD COLUMN `brand` VARCHAR(191) NOT NULL;
