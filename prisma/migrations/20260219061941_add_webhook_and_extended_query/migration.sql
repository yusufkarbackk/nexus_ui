/*
  Warnings:

  - A unique constraint covering the columns `[webhook_token]` on the table `workflows` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `workflow_steps` ADD COLUMN `db_extended_query` TEXT NULL;

-- AlterTable
ALTER TABLE `workflows` ADD COLUMN `webhook_token` VARCHAR(64) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `workflows_webhook_token_key` ON `workflows`(`webhook_token`);
