-- AlterTable
ALTER TABLE `users` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `last_login` TIMESTAMP(0) NULL,
    ADD COLUMN `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `event_type` ENUM('AUTH', 'ADMIN', 'SECURITY', 'DATA') NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `resource` VARCHAR(100) NULL,
    `resource_id` VARCHAR(50) NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `user_ip` VARCHAR(50) NULL,
    `user_agent` VARCHAR(500) NULL,
    `success` BOOLEAN NOT NULL DEFAULT true,
    `message` TEXT NULL,
    `metadata` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `audit_logs_event_type_idx`(`event_type`),
    INDEX `audit_logs_user_id_idx`(`user_id`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
