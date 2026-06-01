/*
  Warnings:

  - The primary key for the `Photo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Photo` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `avatar` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Made the column `category` on table `Photo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `uploader` on table `Photo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_pkey",
ADD COLUMN     "avatar" TEXT NOT NULL,
ADD COLUMN     "likedBy" TEXT[],
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "category" SET NOT NULL,
ALTER COLUMN "uploader" SET NOT NULL,
ADD CONSTRAINT "Photo_pkey" PRIMARY KEY ("id");
