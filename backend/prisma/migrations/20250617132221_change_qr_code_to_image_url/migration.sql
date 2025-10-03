/*
  Warnings:

  - You are about to alter the column `image_url` on the `qr_codes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - A unique constraint covering the columns `[image_url]` on the table `qr_codes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `qr_codes` MODIFY `image_url` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `qr_codes_image_url_key` ON `qr_codes`(`image_url`);
