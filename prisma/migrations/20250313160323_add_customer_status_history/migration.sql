-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'new',
ADD COLUMN     "statusUpdatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CustomerStatusHistory" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerStatusHistory_customerId_idx" ON "CustomerStatusHistory"("customerId");

-- CreateIndex
CREATE INDEX "CustomerStatusHistory_updatedBy_idx" ON "CustomerStatusHistory"("updatedBy");

-- AddForeignKey
ALTER TABLE "CustomerStatusHistory" ADD CONSTRAINT "CustomerStatusHistory_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerStatusHistory" ADD CONSTRAINT "CustomerStatusHistory_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
