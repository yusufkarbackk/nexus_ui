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
    `encryption_enabled` BOOLEAN NOT NULL DEFAULT false,
    `master_secret_encrypted` VARCHAR(500) NULL,
    `secret_version` INTEGER NOT NULL DEFAULT 1,
    `rate_limit_value` INTEGER NOT NULL DEFAULT 0,
    `rate_limit_unit` ENUM('second', 'minute') NOT NULL DEFAULT 'second',

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
    `data_type` VARCHAR(50) NULL,
    `default_value` VARCHAR(255) NULL,
    `null_handling` VARCHAR(50) NULL DEFAULT 'skip',
    `transform_param` VARCHAR(255) NULL,
    `transform_type` VARCHAR(50) NULL,

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
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `workflow_id` BIGINT UNSIGNED NULL,

    INDEX `logs_data_id_index`(`data_id`),
    INDEX `logs_status_index`(`status`),
    INDEX `logs_created_at_index`(`created_at`),
    INDEX `logs_workflow_id_index`(`workflow_id`),
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
    `application_id` BIGINT UNSIGNED NULL,
    `database_configs_id` BIGINT UNSIGNED NULL,
    `target_table` VARCHAR(255) NULL,
    `destination_type` ENUM('database', 'rest', 'sap', 'sequential') NOT NULL DEFAULT 'database',
    `rest_destination_id` BIGINT UNSIGNED NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,
    `mqtt_source_id` BIGINT UNSIGNED NULL,
    `source_type` ENUM('sender_app', 'mqtt_source') NOT NULL DEFAULT 'sender_app',
    `sap_destination_id` BIGINT UNSIGNED NULL,
    `db_query_type` ENUM('select', 'insert', 'upsert', 'update', 'delete') NOT NULL DEFAULT 'insert',
    `db_primary_key` VARCHAR(255) NULL,
    `sequential_workflow_id` BIGINT UNSIGNED NULL,

    INDEX `fk_pipelines_rest_destination`(`rest_destination_id`),
    INDEX `fk_pipelines_sap_destination`(`sap_destination_id`),
    INDEX `fk_pipelines_sequential_workflow`(`sequential_workflow_id`),
    INDEX `pipelines_application_id_foreign`(`application_id`),
    INDEX `fk_pipelines_mqtt_source`(`mqtt_source_id`),
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
    `body_fields` JSON NULL,
    `body_template` TEXT NULL,

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
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_login` TIMESTAMP(0) NULL,
    `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',

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
    `redis_retention_hours` DOUBLE NOT NULL DEFAULT 168,
    `delete_failed_immediately` BOOLEAN NOT NULL DEFAULT false,
    `workflow_type` ENUM('fan_out', 'sequential') NOT NULL DEFAULT 'fan_out',
    `webhook_token` VARCHAR(64) NULL,
    `rate_limit_value` INTEGER NOT NULL DEFAULT 0,
    `rate_limit_unit` ENUM('second', 'minute') NOT NULL DEFAULT 'second',

    UNIQUE INDEX `workflows_webhook_token_key`(`webhook_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `encryption_enabled` BOOLEAN NOT NULL DEFAULT false,
    `master_secret_encrypted` VARCHAR(500) NULL,
    `secret_version` INTEGER NOT NULL DEFAULT 1,

    INDEX `mqtt_sources_is_active_index`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mqtt_source_fields` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `mqtt_source_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `data_type` ENUM('string', 'number', 'boolean', 'json') NOT NULL DEFAULT 'string',
    `description` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `mqtt_source_fields_mqtt_source_id_index`(`mqtt_source_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mqtt_subscriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `mqtt_source_id` BIGINT UNSIGNED NOT NULL,
    `workflow_id` BIGINT UNSIGNED NULL,
    `topic_pattern` VARCHAR(500) NOT NULL,
    `qos` TINYINT NOT NULL DEFAULT 0,
    `payload_format` ENUM('json', 'raw', 'csv') NOT NULL DEFAULT 'json',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL,

    INDEX `mqtt_subscriptions_source_id_index`(`mqtt_source_id`),
    INDEX `mqtt_subscriptions_workflow_id_index`(`workflow_id`),
    UNIQUE INDEX `unique_mqtt_topic`(`mqtt_source_id`, `topic_pattern`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `host` VARCHAR(255) NOT NULL DEFAULT '',
    `port` INTEGER NOT NULL DEFAULT 30015,
    `database_name` VARCHAR(255) NULL,

    INDEX `sap_destinations_status_index`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sap_pipeline_configs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `pipeline_id` BIGINT UNSIGNED NOT NULL,
    `sap_destination_id` BIGINT UNSIGNED NOT NULL,
    `query_type` ENUM('select', 'insert', 'upsert', 'update', 'delete') NOT NULL DEFAULT 'insert',
    `sql_query` TEXT NOT NULL,
    `target_schema` VARCHAR(255) NULL,
    `target_table` VARCHAR(255) NULL,
    `primary_key_column` VARCHAR(255) NULL,
    `param_mapping` JSON NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `sap_pipeline_configs_pipeline_id_index`(`pipeline_id`),
    INDEX `sap_pipeline_configs_sap_destination_id_index`(`sap_destination_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agents` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('active', 'inactive', 'revoked') NOT NULL DEFAULT 'active',
    `last_seen_at` TIMESTAMP(0) NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,
    `agent_type` VARCHAR(50) NOT NULL DEFAULT '',

    UNIQUE INDEX `agents_token_key`(`token`),
    INDEX `agents_token_index`(`token`),
    INDEX `agents_type_index`(`agent_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_steps` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `workflow_id` BIGINT UNSIGNED NOT NULL,
    `step_order` INTEGER NOT NULL,
    `step_name` VARCHAR(255) NOT NULL,
    `step_type` ENUM('rest_call', 'db_query', 'sap_query', 'transform', 'condition', 'delay', 'redis_command', 'ai_agent') NOT NULL,
    `rest_destination_id` BIGINT UNSIGNED NULL,
    `rest_method` VARCHAR(10) NULL,
    `rest_path` VARCHAR(500) NULL,
    `rest_body_template` TEXT NULL,
    `rest_headers_template` TEXT NULL,
    `database_config_id` BIGINT UNSIGNED NULL,
    `db_query_type` ENUM('select', 'insert', 'update', 'delete', 'upsert') NULL,
    `db_target_table` VARCHAR(255) NULL,
    `db_primary_key` VARCHAR(255) NULL,
    `db_extended_query` TEXT NULL,
    `sap_destination_id` BIGINT UNSIGNED NULL,
    `sap_query_type` VARCHAR(50) NULL,
    `sap_sql_query` TEXT NULL,
    `transform_expression` TEXT NULL,
    `condition_expression` TEXT NULL,
    `on_true_step` INTEGER NULL,
    `on_false_step` INTEGER NULL,
    `delay_seconds` INTEGER NULL DEFAULT 0,
    `redis_destination_id` INTEGER NULL,
    `redis_command` VARCHAR(20) NULL,
    `redis_key` VARCHAR(500) NULL,
    `redis_field` VARCHAR(500) NULL,
    `redis_value` TEXT NULL,
    `redis_ttl` INTEGER NULL DEFAULT 0,
    `ai_provider_id` BIGINT UNSIGNED NULL,
    `ai_system_prompt` TEXT NULL,
    `ai_prompt_template` TEXT NULL,
    `ai_model` VARCHAR(100) NULL,
    `ai_temperature` DOUBLE NULL DEFAULT 0.7,
    `ai_max_tokens` INTEGER NULL DEFAULT 4096,
    `ai_output_type` ENUM('text', 'image', 'video') NULL DEFAULT 'text',
    `ai_output_format` ENUM('json', 'raw', 'markdown') NULL DEFAULT 'json',
    `ai_memory_enabled` BOOLEAN NOT NULL DEFAULT false,
    `ai_memory_type` ENUM('conversation', 'buffer', 'summary') NULL DEFAULT 'conversation',
    `ai_memory_ttl` INTEGER NULL DEFAULT 3600,
    `ai_memory_max_messages` INTEGER NULL DEFAULT 50,
    `ai_agent_id` BIGINT UNSIGNED NULL,
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

-- CreateTable
CREATE TABLE `rate_limit_config` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `limit_value` INTEGER NOT NULL DEFAULT 0,
    `limit_unit` ENUM('second', 'minute') NOT NULL DEFAULT 'second',
    `updated_at` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_providers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `provider_type` ENUM('gemini', 'openai', 'mcp', 'custom_api') NOT NULL,
    `base_url` VARCHAR(500) NULL,
    `api_key_encrypted` VARCHAR(500) NULL,
    `default_model` VARCHAR(100) NULL,
    `timeout_seconds` INTEGER NOT NULL DEFAULT 60,
    `max_tokens` INTEGER NOT NULL DEFAULT 4096,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `ai_providers_name_key`(`name`),
    INDEX `ai_providers_status_index`(`status`),
    INDEX `ai_providers_type_index`(`provider_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_agents` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `ai_provider_id` BIGINT UNSIGNED NOT NULL,
    `model` VARCHAR(100) NULL,
    `system_prompt` TEXT NOT NULL,
    `temperature` DOUBLE NOT NULL DEFAULT 0.7,
    `max_tokens` INTEGER NOT NULL DEFAULT 4096,
    `max_iterations` INTEGER NOT NULL DEFAULT 10,
    `memory_enabled` BOOLEAN NOT NULL DEFAULT true,
    `memory_type` ENUM('redis', 'simple') NOT NULL DEFAULT 'redis',
    `memory_ttl` INTEGER NOT NULL DEFAULT 3600,
    `memory_max_messages` INTEGER NOT NULL DEFAULT 50,
    `output_type` ENUM('text', 'json', 'image', 'video') NOT NULL DEFAULT 'text',
    `output_schema` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `ai_agents_name_key`(`name`),
    INDEX `ai_agents_active_index`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_agent_tools` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `agent_id` BIGINT UNSIGNED NOT NULL,
    `tool_name` VARCHAR(255) NOT NULL,
    `tool_description` TEXT NOT NULL,
    `parameters_schema` TEXT NULL,
    `tool_type` ENUM('rest_call', 'db_query', 'redis_command', 'workflow') NOT NULL,
    `rest_destination_id` BIGINT UNSIGNED NULL,
    `rest_method` VARCHAR(10) NULL,
    `rest_path` VARCHAR(500) NULL,
    `rest_body_template` TEXT NULL,
    `rest_headers` TEXT NULL,
    `database_config_id` BIGINT UNSIGNED NULL,
    `db_query` TEXT NULL,
    `redis_destination_id` INTEGER NULL,
    `redis_command` VARCHAR(20) NULL,
    `redis_key_template` VARCHAR(500) NULL,
    `workflow_id` BIGINT UNSIGNED NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `ai_agent_tools_agent_id_index`(`agent_id`),
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
ALTER TABLE `logs` ADD CONSTRAINT `logs_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pipelines` ADD CONSTRAINT `fk_pipelines_mqtt_source` FOREIGN KEY (`mqtt_source_id`) REFERENCES `mqtt_sources`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pipelines` ADD CONSTRAINT `fk_pipelines_rest_destination` FOREIGN KEY (`rest_destination_id`) REFERENCES `rest_destinations`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pipelines` ADD CONSTRAINT `fk_pipelines_sap_destination` FOREIGN KEY (`sap_destination_id`) REFERENCES `sap_destinations`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pipelines` ADD CONSTRAINT `pipelines_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pipelines` ADD CONSTRAINT `pipelines_database_configs_id_foreign` FOREIGN KEY (`database_configs_id`) REFERENCES `database_configs`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pipelines` ADD CONSTRAINT `pipelines_workflow_id_foreign` FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pipelines` ADD CONSTRAINT `fk_pipelines_sequential_workflow` FOREIGN KEY (`sequential_workflow_id`) REFERENCES `workflows`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `table_fields` ADD CONSTRAINT `table_fields_table_id_foreign` FOREIGN KEY (`table_id`) REFERENCES `database_tables`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mqtt_source_fields` ADD CONSTRAINT `mqtt_source_fields_mqtt_source_id_fkey` FOREIGN KEY (`mqtt_source_id`) REFERENCES `mqtt_sources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mqtt_subscriptions` ADD CONSTRAINT `mqtt_subscriptions_mqtt_source_id_fkey` FOREIGN KEY (`mqtt_source_id`) REFERENCES `mqtt_sources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mqtt_subscriptions` ADD CONSTRAINT `mqtt_subscriptions_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agent_apps` ADD CONSTRAINT `agent_apps_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agent_apps` ADD CONSTRAINT `agent_apps_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sap_pipeline_configs` ADD CONSTRAINT `sap_pipeline_configs_pipeline_id_fkey` FOREIGN KEY (`pipeline_id`) REFERENCES `pipelines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sap_pipeline_configs` ADD CONSTRAINT `sap_pipeline_configs_sap_destination_id_fkey` FOREIGN KEY (`sap_destination_id`) REFERENCES `sap_destinations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_rest_destination_id_fkey` FOREIGN KEY (`rest_destination_id`) REFERENCES `rest_destinations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_database_config_id_fkey` FOREIGN KEY (`database_config_id`) REFERENCES `database_configs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_sap_destination_id_fkey` FOREIGN KEY (`sap_destination_id`) REFERENCES `sap_destinations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_redis_destination_id_fkey` FOREIGN KEY (`redis_destination_id`) REFERENCES `redis_destinations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_ai_provider_id_fkey` FOREIGN KEY (`ai_provider_id`) REFERENCES `ai_providers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_ai_agent_id_fkey` FOREIGN KEY (`ai_agent_id`) REFERENCES `ai_agents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `step_field_mappings` ADD CONSTRAINT `step_field_mappings_step_id_fkey` FOREIGN KEY (`step_id`) REFERENCES `workflow_steps`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_agents` ADD CONSTRAINT `ai_agents_ai_provider_id_fkey` FOREIGN KEY (`ai_provider_id`) REFERENCES `ai_providers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_agent_tools` ADD CONSTRAINT `ai_agent_tools_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `ai_agents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
