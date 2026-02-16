-- AlterTable
ALTER TABLE `pipelines` ADD COLUMN `db_primary_key` VARCHAR(255) NULL,
    ADD COLUMN `db_query_type` ENUM('select', 'insert', 'update', 'delete') NOT NULL DEFAULT 'insert';
