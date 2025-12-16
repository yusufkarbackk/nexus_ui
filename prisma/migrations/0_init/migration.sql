-- CreateTable
CREATE TABLE `application_fields` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `application_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `data_type` ENUM('string', 'number', 'boolean', 'json') NOT NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `application_fields_application_id_foreign`(`application_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_table_subscriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `application_id` BIGINT UNSIGNED NOT NULL,
    `database_table_id` BIGINT UNSIGNED NOT NULL,
    `consumer_group` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    `field_mappings` JSON NULL,

    INDEX `application_table_subscriptions_application_id_foreign`(`application_id`),
    INDEX `application_table_subscriptions_database_table_id_foreign`(`database_table_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `app_key` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `applications_api_key_unique`(`app_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `database_configs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `connection_type` ENUM('mysql', 'pgsql', 'postgresql') NOT NULL,
    `host` VARCHAR(255) NOT NULL,
    `port` INTEGER NOT NULL,
    `database_name` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL DEFAULT '',
    `status` ENUM('up', 'down') NOT NULL DEFAULT 'up',
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    `ssl_mode` VARCHAR(255) NOT NULL DEFAULT 'disable',
    `connection_name` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,

    UNIQUE INDEX `database_configs_connection_name_unique`(`connection_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `database_field_subscriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `application_table_subscription_id` BIGINT UNSIGNED NOT NULL,
    `application_field_id` BIGINT UNSIGNED NOT NULL,
    `mapped_to` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    `default_value` VARCHAR(255) NULL,

    INDEX `database_field_subscriptions_application_field_id_foreign`(`application_field_id`),
    INDEX `fk_app_table_sub`(`application_table_subscription_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `database_tables` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `database_config_id` BIGINT UNSIGNED NOT NULL,
    `table_name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `database_tables_database_config_id_foreign`(`database_config_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `failed_jobs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(255) NOT NULL,
    `connection` TEXT NOT NULL,
    `queue` TEXT NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `exception` LONGTEXT NOT NULL,
    `failed_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `failed_jobs_uuid_unique`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `field_mappings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `pipeline_id` BIGINT UNSIGNED NOT NULL,
    `source_field` VARCHAR(255) NOT NULL,
    `destination_column` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `field_mappings_pipeline_id_foreign`(`pipeline_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `data_id` VARCHAR(255) NULL,
    `source` VARCHAR(255) NOT NULL,
    `destination` VARCHAR(255) NOT NULL,
    `host` VARCHAR(255) NOT NULL DEFAULT '',
    `data_sent` JSON NOT NULL,
    `data_received` JSON NULL,
    `sent_at` TIMESTAMP(0) NULL,
    `received_at` TIMESTAMP(0) NULL,
    `message` VARCHAR(255) NOT NULL DEFAULT '',
    `status` VARCHAR(255) NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `logs_data_id_index`(`data_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `migrations` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `migration` VARCHAR(255) NOT NULL,
    `batch` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personal_access_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tokenable_type` VARCHAR(255) NOT NULL,
    `tokenable_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `abilities` TEXT NULL,
    `last_used_at` TIMESTAMP(0) NULL,
    `expires_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `personal_access_tokens_token_unique`(`token`),
    INDEX `personal_access_tokens_tokenable_type_tokenable_id_index`(`tokenable_type`, `tokenable_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pipelines` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `workflow_id` BIGINT UNSIGNED NOT NULL,
    `application_id` BIGINT UNSIGNED NOT NULL,
    `database_configs_id` BIGINT UNSIGNED NULL,
    `target_table` VARCHAR(255) NULL,
    `destination_type` ENUM('database', 'rest') NOT NULL DEFAULT 'database',
    `rest_destination_id` BIGINT UNSIGNED NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `fk_pipelines_rest_destination`(`rest_destination_id`),
    INDEX `pipelines_application_id_foreign`(`application_id`),
    INDEX `pipelines_database_configs_id_foreign`(`database_configs_id`),
    INDEX `pipelines_workflow_id_foreign`(`workflow_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rest_destinations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `base_url` VARCHAR(500) NOT NULL,
    `method` ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE') NOT NULL DEFAULT 'POST',
    `headers` JSON NULL,
    `auth_type` ENUM('none', 'bearer', 'api_key', 'basic') NOT NULL DEFAULT 'none',
    `auth_config` TEXT NULL,
    `timeout_seconds` INTEGER NOT NULL DEFAULT 30,
    `status` ENUM('up', 'down') NOT NULL DEFAULT 'up',
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `rest_destinations_name_unique`(`name`),
    INDEX `idx_auth_type`(`auth_type`),
    INDEX `idx_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `table_fields` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `table_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `data_type` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `table_fields_table_id_foreign`(`table_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `email_verified_at` TIMESTAMP(0) NULL,
    `password` VARCHAR(255) NOT NULL,
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `users_email_unique`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflows` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `application_fields` ADD CONSTRAINT `application_fields_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `application_table_subscriptions` ADD CONSTRAINT `application_table_subscriptions_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `application_table_subscriptions` ADD CONSTRAINT `application_table_subscriptions_database_table_id_foreign` FOREIGN KEY (`database_table_id`) REFERENCES `database_tables`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `database_field_subscriptions` ADD CONSTRAINT `database_field_subscriptions_application_field_id_foreign` FOREIGN KEY (`application_field_id`) REFERENCES `application_fields`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `database_field_subscriptions` ADD CONSTRAINT `fk_app_table_sub` FOREIGN KEY (`application_table_subscription_id`) REFERENCES `application_table_subscriptions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `database_tables` ADD CONSTRAINT `database_tables_database_config_id_foreign` FOREIGN KEY (`database_config_id`) REFERENCES `database_configs`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `field_mappings` ADD CONSTRAINT `field_mappings_pipeline_id_foreign` FOREIGN KEY (`pipeline_id`) REFERENCES `pipelines`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pipelines` ADD CONSTRAINT `fk_pipelines_rest_destination` FOREIGN KEY (`rest_destination_id`) REFERENCES `rest_destinations`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pipelines` ADD CONSTRAINT `pipelines_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pipelines` ADD CONSTRAINT `pipelines_database_configs_id_foreign` FOREIGN KEY (`database_configs_id`) REFERENCES `database_configs`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pipelines` ADD CONSTRAINT `pipelines_workflow_id_foreign` FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `table_fields` ADD CONSTRAINT `table_fields_table_id_foreign` FOREIGN KEY (`table_id`) REFERENCES `database_tables`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

