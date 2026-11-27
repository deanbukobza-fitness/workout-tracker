-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "boostCustomerId" INTEGER,
ADD COLUMN     "boostSubscriptionActive" BOOLEAN,
ADD COLUMN     "boostSubscriptionCheckedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_boostCustomerId_key" ON "User"("boostCustomerId");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");
