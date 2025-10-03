-- DropForeignKey
ALTER TABLE `menu_items` DROP FOREIGN KEY `menu_items_category_id_fkey`;

-- CreateTable
CREATE TABLE `menu_item_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `item_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `menu_item_categories_category_id_item_order_idx`(`category_id`, `item_order`),
    INDEX `menu_item_categories_item_id_idx`(`item_id`),
    UNIQUE INDEX `menu_item_categories_item_id_category_id_key`(`item_id`, `category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `menu_item_categories` ADD CONSTRAINT `menu_item_categories_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_item_categories` ADD CONSTRAINT `menu_item_categories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
