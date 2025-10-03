/*
  Warnings:

  - You are about to drop the column `createdAt` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `admin` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `admin` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `name` on the `admin` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `role` on the `admin` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to drop the column `adminId` on the `store` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `store` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `store` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `store` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `store` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - A unique constraint covering the columns `[qr_code]` on the table `Store` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admin_id` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qr_code` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Made the column `address` on table `store` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `store` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `store` DROP FOREIGN KEY `Store_adminId_fkey`;

-- DropIndex
DROP INDEX `Store_adminId_key` ON `store`;

-- AlterTable
ALTER TABLE `admin` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `email` VARCHAR(100) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL,
    MODIFY `name` VARCHAR(50) NOT NULL,
    MODIFY `role` ENUM('ADMIN', 'STORE_OWNER') NOT NULL;

-- AlterTable
ALTER TABLE `store` DROP COLUMN `adminId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `admin_id` INTEGER NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `qr_code` VARCHAR(100) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `name` VARCHAR(100) NOT NULL,
    MODIFY `address` VARCHAR(200) NOT NULL,
    MODIFY `phone` VARCHAR(20) NOT NULL;

-- CreateTable
CREATE TABLE `MenuCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MenuItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER NOT NULL,
    `table_number` INTEGER NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `menu_item_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price_at_time` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Store_qr_code_key` ON `Store`(`qr_code`);

-- AddForeignKey
ALTER TABLE `Store` ADD CONSTRAINT `Store_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuCategory` ADD CONSTRAINT `MenuCategory_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuItem` ADD CONSTRAINT `MenuItem_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuItem` ADD CONSTRAINT `MenuItem_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `MenuCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_menu_item_id_fkey` FOREIGN KEY (`menu_item_id`) REFERENCES `MenuItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
