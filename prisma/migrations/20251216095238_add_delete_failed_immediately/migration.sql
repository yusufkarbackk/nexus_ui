-- AlterTable
ALTER TABLE `workflows` ADD COLUMN `delete_failed_immediately` BOOLEAN NOT NULL DEFAULT false;
