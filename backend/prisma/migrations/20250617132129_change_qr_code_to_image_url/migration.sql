/*
  Warnings:

  - You are about to drop the column `qr_code` on the `qr_codes` table. All the data in the column will be lost.
  - Added the required column `image_url` to the `qr_codes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `qr_codes` DROP COLUMN `qr_code`,
    ADD COLUMN `image_url` VARCHAR(255) NOT NULL;
