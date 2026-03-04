-- AlterTable
ALTER TABLE `workflows` ADD COLUMN `rate_limit_unit` ENUM('second', 'minute') NOT NULL DEFAULT 'second',
    ADD COLUMN `rate_limit_value` INTEGER NOT NULL DEFAULT 0;
