-- AlterTable
ALTER TABLE `rest_destinations` ADD COLUMN `body_fields` JSON NULL;

-- CreateTable
CREATE TABLE `agents` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('active', 'inactive', 'revoked') NOT NULL DEFAULT 'active',
    `last_seen_at` TIMESTAMP(0) NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `agents_token_unique`(`token`),
    INDEX `agents_status_index`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agent_apps` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `agent_id` BIGINT UNSIGNED NOT NULL,
    `application_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL,

    INDEX `agent_apps_agent_id_index`(`agent_id`),
    INDEX `agent_apps_application_id_index`(`application_id`),
    UNIQUE INDEX `unique_agent_app`(`agent_id`, `application_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `agent_apps` ADD CONSTRAINT `agent_apps_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agent_apps` ADD CONSTRAINT `agent_apps_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
