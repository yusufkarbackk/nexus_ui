-- AlterTable
ALTER TABLE `workflow_steps` ADD COLUMN `sap_destination_id` BIGINT UNSIGNED NULL,
    ADD COLUMN `sap_query_type` VARCHAR(50) NULL,
    ADD COLUMN `sap_sql_query` TEXT NULL,
    MODIFY `step_type` ENUM('rest_call', 'db_query', 'sap_query', 'transform', 'condition', 'delay') NOT NULL;

-- AddForeignKey
ALTER TABLE `workflow_steps` ADD CONSTRAINT `workflow_steps_sap_destination_id_fkey` FOREIGN KEY (`sap_destination_id`) REFERENCES `sap_destinations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
