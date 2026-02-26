-- AlterTable
ALTER TABLE `workflow_steps` ADD COLUMN `redis_command` VARCHAR(20) NULL,
    ADD COLUMN `redis_destination_id` INTEGER NULL,
    ADD COLUMN `redis_field` VARCHAR(500) NULL,
    ADD COLUMN `redis_key` VARCHAR(500) NULL,
    ADD COLUMN `redis_ttl` INTEGER NULL DEFAULT 0,
    ADD COLUMN `redis_value` TEXT NULL,
    MODIFY `step_type` ENUM('rest_call', 'db_query', 'sap_query', 'transform', 'condition', 'delay', 'redis_command') NOT NULL;

-- CreateTable
CREATE TABLE `redis_destinations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `host` VARCHAR(255) NOT NULL,
    `port` INTEGER NOT NULL DEFAULT 6379,
    `password` VARCHAR(500) NULL,
    `database_number` INTEGER NOT NULL DEFAULT 0,
    `use_tls` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('up', 'down') NOT NULL DEFAULT 'up',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_redis_destination_id_fkey` FOREIGN KEY (`redis_destination_id`) REFERENCES `redis_destinations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
