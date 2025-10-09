/*
  Warnings:

  - A unique constraint covering the columns `[order_code]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_code` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `approved_at` DATETIME(3) NULL,
    ADD COLUMN `order_code` VARCHAR(100) NOT NULL,
    ADD COLUMN `payment_key` VARCHAR(200) NULL,
    ADD COLUMN `payment_method` VARCHAR(30) NULL,
    MODIFY `status` ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'confirmed';

-- CreateIndex
CREATE UNIQUE INDEX `orders_order_code_key` ON `orders`(`order_code`);
