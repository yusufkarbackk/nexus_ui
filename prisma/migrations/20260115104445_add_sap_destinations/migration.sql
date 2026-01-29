-- AlterTable
ALTER TABLE `pipelines` MODIFY `destination_type` ENUM('database', 'rest', 'sap') NOT NULL DEFAULT 'database';

-- CreateTable
CREATE TABLE `sap_destinations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `dsn_name` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password_encrypted` VARCHAR(500) NOT NULL,
    `timeout_seconds` INTEGER NOT NULL DEFAULT 30,
    `max_rows` INTEGER NOT NULL DEFAULT 1000,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `sap_destinations_status_index`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sap_pipeline_configs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `pipeline_id` BIGINT UNSIGNED NOT NULL,
    `sap_destination_id` BIGINT UNSIGNED NOT NULL,
    `query_type` ENUM('select', 'insert') NOT NULL DEFAULT 'select',
    `sql_query` TEXT NOT NULL,
    `param_mapping` JSON NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `sap_pipeline_configs_pipeline_id_index`(`pipeline_id`),
    INDEX `sap_pipeline_configs_sap_destination_id_index`(`sap_destination_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sap_pipeline_configs` ADD CONSTRAINT `sap_pipeline_configs_pipeline_id_fkey` FOREIGN KEY (`pipeline_id`) REFERENCES `pipelines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sap_pipeline_configs` ADD CONSTRAINT `sap_pipeline_configs_sap_destination_id_fkey` FOREIGN KEY (`sap_destination_id`) REFERENCES `sap_destinations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
