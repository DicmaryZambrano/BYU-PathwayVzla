-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';
