-- AlterTable
ALTER TABLE `field_mappings` ADD COLUMN `data_type` VARCHAR(50) NULL,
    ADD COLUMN `default_value` VARCHAR(255) NULL,
    ADD COLUMN `null_handling` VARCHAR(50) NULL DEFAULT 'skip',
    ADD COLUMN `transform_param` VARCHAR(255) NULL,
    ADD COLUMN `transform_type` VARCHAR(50) NULL;

-- AddForeignKey
ALTER TABLE `mqtt_subscriptions` ADD CONSTRAINT `mqtt_subscriptions_mqtt_source_id_fkey` FOREIGN KEY (`mqtt_source_id`) REFERENCES `mqtt_sources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
