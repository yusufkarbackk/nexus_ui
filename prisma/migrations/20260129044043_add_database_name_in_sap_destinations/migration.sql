-- DropIndex
DROP INDEX `agents_status_index` ON `agents`;

-- AlterTable
ALTER TABLE `agents` ADD COLUMN `agent_type` VARCHAR(50) NOT NULL DEFAULT '',
    MODIFY `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `sap_destinations` ADD COLUMN `database_name` VARCHAR(255) NULL;

-- CreateIndex
CREATE INDEX `agents_token_index` ON `agents`(`token`);

-- CreateIndex
CREATE INDEX `agents_type_index` ON `agents`(`agent_type`);

-- RenameIndex
ALTER TABLE `agents` RENAME INDEX `agents_token_unique` TO `agents_token_key`;
