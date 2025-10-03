-- CreateTable
CREATE TABLE `qr_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `store_id` INTEGER NOT NULL,
    `table_number` INTEGER NOT NULL,
    `qr_code` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `qr_codes_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `qr_codes` ADD CONSTRAINT `qr_codes_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
