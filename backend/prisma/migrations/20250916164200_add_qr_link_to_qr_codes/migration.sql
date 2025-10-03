/*
  Warnings:

  - Added the required column `qr_link` to the `qr_codes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `qr_codes` ADD COLUMN `qr_link` VARCHAR(191) NOT NULL;
