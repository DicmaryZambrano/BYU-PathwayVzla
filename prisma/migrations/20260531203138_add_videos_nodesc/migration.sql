/*
  Warnings:

  - The primary key for the `Video` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `thumbnailUrl` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP CONSTRAINT "Video_pkey",
DROP COLUMN "thumbnailUrl",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'upload',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Video_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Video_id_seq";
