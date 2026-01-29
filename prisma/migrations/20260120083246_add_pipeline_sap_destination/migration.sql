-- AlterTable
ALTER TABLE `pipelines` ADD COLUMN `sap_destination_id` BIGINT UNSIGNED NULL;

-- CreateIndex
CREATE INDEX `fk_pipelines_sap_destination` ON `pipelines`(`sap_destination_id`);

-- AddForeignKey
ALTER TABLE `pipelines` ADD CONSTRAINT `fk_pipelines_sap_destination` FOREIGN KEY (`sap_destination_id`) REFERENCES `sap_destinations`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
