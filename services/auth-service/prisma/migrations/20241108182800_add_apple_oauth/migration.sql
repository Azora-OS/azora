-- AlterTable
ALTER TABLE "users" ADD COLUMN     "appleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_appleId_key" ON "users"("appleId");