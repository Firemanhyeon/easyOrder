/*
  Warnings:

  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `menucategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `menuitem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orderitem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `store` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `menucategory` DROP FOREIGN KEY `MenuCategory_store_id_fkey`;

-- DropForeignKey
ALTER TABLE `menuitem` DROP FOREIGN KEY `MenuItem_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `menuitem` DROP FOREIGN KEY `MenuItem_store_id_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_store_id_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_menu_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `store` DROP FOREIGN KEY `Store_admin_id_fkey`;

-- DropTable
DROP TABLE `admin`;

-- DropTable
DROP TABLE `menucategory`;

-- DropTable
DROP TABLE `menuitem`;

-- DropTable
DROP TABLE `order`;

-- DropTable
DROP TABLE `orderitem`;

-- DropTable
DROP TABLE `store`;

-- CreateTable
CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `role` ENUM('admin', 'store_owner') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(200) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `admin_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stores_admin_id_idx`(`admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `menu_categories_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `menu_items_category_id_idx`(`category_id`),
    INDEX `menu_items_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER NOT NULL,
    `table_number` INTEGER NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `orders_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `menu_item_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price_at_time` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_items_menu_item_id_idx`(`menu_item_id`),
    INDEX `order_items_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stores` ADD CONSTRAINT `stores_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_categories` ADD CONSTRAINT `menu_categories_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_menu_item_id_fkey` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
