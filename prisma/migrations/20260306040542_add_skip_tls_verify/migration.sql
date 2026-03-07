-- AlterTable
ALTER TABLE `rest_destinations` ADD COLUMN `skip_tls_verify` BOOLEAN NOT NULL DEFAULT false;
