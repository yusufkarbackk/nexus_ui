-- AlterTable
ALTER TABLE `logs` ADD COLUMN `retry_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `workflow_id` BIGINT UNSIGNED NULL;

-- AlterTable
ALTER TABLE `workflows` ADD COLUMN `redis_retention_hours` INTEGER NOT NULL DEFAULT 168;

-- CreateIndex
CREATE INDEX `logs_status_index` ON `logs`(`status`);

-- CreateIndex
CREATE INDEX `logs_created_at_index` ON `logs`(`created_at`);

-- CreateIndex
CREATE INDEX `logs_workflow_id_index` ON `logs`(`workflow_id`);

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_workflow_id_fkey` FOREIGN KEY (`workflow_id`) REFERENCES `workflows`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
