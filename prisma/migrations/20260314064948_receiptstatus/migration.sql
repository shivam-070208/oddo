/*
  Warnings:

  - The `status` column on the `Receipt` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReceiptStatus" AS ENUM ('DRAFT', 'READY', 'DONE', 'CANCELLED');

-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "status",
ADD COLUMN     "status" "ReceiptStatus" NOT NULL DEFAULT 'DRAFT';
