-- AlterTable
ALTER TABLE `applications` ADD COLUMN `encryption_enabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `master_secret_encrypted` VARCHAR(500) NULL,
    ADD COLUMN `secret_version` INTEGER NOT NULL DEFAULT 1;
