-- CreateTable
CREATE TABLE `mqtt_sources` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `broker_url` VARCHAR(500) NOT NULL,
    `username` VARCHAR(255) NULL,
    `password_encrypted` VARCHAR(500) NULL,
    `client_id` VARCHAR(255) NULL,
    `use_tls` BOOLEAN NOT NULL DEFAULT false,
    `ca_cert` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('connected', 'disconnected', 'error') NOT NULL DEFAULT 'disconnected',
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `mqtt_sources_is_active_index`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mqtt_subscriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `mqtt_source_id` BIGINT UNSIGNED NOT NULL,
    `workflow_id` BIGINT UNSIGNED NOT NULL,
    `topic_pattern` VARCHAR(500) NOT NULL,
    `qos` TINYINT NOT NULL DEFAULT 0,
    `payload_format` ENUM('json', 'raw', 'csv') NOT NULL DEFAULT 'json',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL,

    INDEX `mqtt_subscriptions_source_id_index`(`mqtt_source_id`),
    INDEX `mqtt_subscriptions_workflow_id_index`(`workflow_id`),
    UNIQUE INDEX `unique_topic_workflow`(`mqtt_source_id`, `topic_pattern`, `workflow_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mqtt_subscriptions` ADD CONSTRAINT `mqtt_subscriptions_mqtt_source_id_fkey` FOREIGN KEY (`mqtt_source_id`) REFERENCES `mqtt_sources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mqtt_subscriptions` ADD CONSTRAINT `mqtt_subscriptions_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
