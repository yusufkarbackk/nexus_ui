-- AlterTable
ALTER TABLE `sap_pipeline_configs` ADD COLUMN `target_schema` VARCHAR(255) NULL,
    ADD COLUMN `target_table` VARCHAR(255) NULL,
    MODIFY `query_type` ENUM('select', 'insert', 'update', 'delete') NOT NULL DEFAULT 'insert';
