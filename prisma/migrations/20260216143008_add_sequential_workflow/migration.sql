-- AlterTable
ALTER TABLE `workflows` ADD COLUMN `workflow_type` ENUM('fan_out', 'sequential') NOT NULL DEFAULT 'fan_out';

-- CreateTable
CREATE TABLE `workflow_steps` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `workflow_id` BIGINT UNSIGNED NOT NULL,
    `step_order` INTEGER NOT NULL,
    `step_name` VARCHAR(255) NOT NULL,
    `step_type` ENUM('rest_call', 'db_query', 'transform', 'condition', 'delay') NOT NULL,
    `rest_destination_id` BIGINT UNSIGNED NULL,
    `rest_method` VARCHAR(10) NULL,
    `rest_path` VARCHAR(500) NULL,
    `rest_body_template` TEXT NULL,
    `database_config_id` BIGINT UNSIGNED NULL,
    `db_query_type` ENUM('select', 'insert', 'update', 'delete', 'upsert') NULL,
    `db_target_table` VARCHAR(255) NULL,
    `db_primary_key` VARCHAR(255) NULL,
    `transform_expression` TEXT NULL,
    `condition_expression` TEXT NULL,
    `on_true_step` INTEGER NULL,
    `on_false_step` INTEGER NULL,
    `delay_seconds` INTEGER NULL DEFAULT 0,
    `input_mapping` TEXT NULL,
    `output_variable` VARCHAR(255) NULL DEFAULT 'result',
    `on_error` ENUM('stop', 'skip', 'retry') NOT NULL DEFAULT 'stop',
    `max_retries` INTEGER NOT NULL DEFAULT 3,
    `timeout_seconds` INTEGER NOT NULL DEFAULT 30,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `workflow_steps_workflow_id_index`(`workflow_id`),
    INDEX `workflow_steps_order_index`(`workflow_id`, `step_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `step_field_mappings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `step_id` BIGINT UNSIGNED NOT NULL,
    `source_field` VARCHAR(255) NOT NULL,
    `destination_column` VARCHAR(255) NOT NULL,
    `data_type` VARCHAR(50) NULL,
    `transform_type` VARCHAR(50) NULL,
    `transform_param` VARCHAR(255) NULL,
    `default_value` VARCHAR(255) NULL,
    `null_handling` VARCHAR(50) NULL DEFAULT 'skip',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `step_field_mappings_step_id_index`(`step_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_rest_destination_id_fkey` FOREIGN KEY (`rest_destination_id`) REFERENCES `rest_destinations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_database_config_id_fkey` FOREIGN KEY (`database_config_id`) REFERENCES `database_configs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `step_field_mappings` ADD CONSTRAINT `step_field_mappings_step_id_fkey` FOREIGN KEY (`step_id`) REFERENCES `workflow_steps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
