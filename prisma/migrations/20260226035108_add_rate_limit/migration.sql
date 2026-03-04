-- AlterTable
ALTER TABLE `applications` ADD COLUMN `rate_limit_unit` ENUM('second', 'minute') NOT NULL DEFAULT 'second',
    ADD COLUMN `rate_limit_value` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `rate_limit_config` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `limit_value` INTEGER NOT NULL DEFAULT 0,
    `limit_unit` ENUM('second', 'minute') NOT NULL DEFAULT 'second',
    `updated_at` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
