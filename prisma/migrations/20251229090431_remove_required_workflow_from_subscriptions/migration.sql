/*
  Warnings:

  - A unique constraint covering the columns `[mqtt_source_id,topic_pattern]` on the table `mqtt_subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `mqtt_subscriptions` DROP FOREIGN KEY `mqtt_subscriptions_mqtt_source_id_fkey`;

-- DropForeignKey
ALTER TABLE `mqtt_subscriptions` DROP FOREIGN KEY `mqtt_subscriptions_workflow_id_fkey`;

-- DropIndex
DROP INDEX `unique_topic_workflow` ON `mqtt_subscriptions`;

-- AlterTable
ALTER TABLE `mqtt_sources` ADD COLUMN `encryption_enabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `master_secret_encrypted` VARCHAR(500) NULL,
    ADD COLUMN `secret_version` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `mqtt_subscriptions` MODIFY `workflow_id` BIGINT UNSIGNED NULL;

-- AlterTable
ALTER TABLE `pipelines` ADD COLUMN `mqtt_source_id` BIGINT UNSIGNED NULL,
    ADD COLUMN `source_type` ENUM('sender_app', 'mqtt_source') NOT NULL DEFAULT 'sender_app',
    MODIFY `application_id` BIGINT UNSIGNED NULL;

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

-- CreateIndex
CREATE UNIQUE INDEX `unique_mqtt_topic` ON `mqtt_subscriptions`(`mqtt_source_id`, `topic_pattern`);

-- CreateIndex
CREATE INDEX `fk_pipelines_mqtt_source` ON `pipelines`(`mqtt_source_id`);

-- AddForeignKey (rest_destination FK already exists, skipping)

-- AddForeignKey
ALTER TABLE `pipelines` ADD CONSTRAINT `fk_pipelines_mqtt_source` FOREIGN KEY (`mqtt_source_id`) REFERENCES `mqtt_sources`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mqtt_source_fields` ADD CONSTRAINT `mqtt_source_fields_mqtt_source_id_fkey` FOREIGN KEY (`mqtt_source_id`) REFERENCES `mqtt_sources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mqtt_subscriptions` ADD CONSTRAINT `mqtt_subscriptions_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
