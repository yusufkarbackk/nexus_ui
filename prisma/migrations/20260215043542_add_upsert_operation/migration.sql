-- AlterTable
ALTER TABLE `pipelines` MODIFY `db_query_type` ENUM('select', 'insert', 'upsert', 'update', 'delete') NOT NULL DEFAULT 'insert';

-- AlterTable
ALTER TABLE `sap_pipeline_configs` MODIFY `query_type` ENUM('select', 'insert', 'upsert', 'update', 'delete') NOT NULL DEFAULT 'insert';
