-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'AGENT');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PickupStatus" AS ENUM ('AWAITING_VERIFICATION', 'REJECTED', 'POOLED', 'SCHEDULED', 'COLLECTED');

-- CreateEnum
CREATE TYPE "ClusterStatus" AS ENUM ('OPEN', 'SCHEDULED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ZoneType" AS ENUM ('CAMPUS_HOSTEL', 'PIN_CODE');

-- CreateEnum
CREATE TYPE "TxnType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "TxnReason" AS ENUM ('PICKUP_PAYOUT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "hostelCode" TEXT,
    "pinCode" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "walletBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WasteItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "conditionForm" JSONB NOT NULL,
    "s3Key" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'PENDING',
    "imageHash" TEXT,
    "detectedLabel" TEXT,
    "confidence" DOUBLE PRECISION,
    "estimatedValue" INTEGER,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WasteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "status" "PickupStatus" NOT NULL DEFAULT 'AWAITING_VERIFICATION',
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "hostelCode" TEXT,
    "pinCode" TEXT NOT NULL,
    "clusterId" TEXT,
    "qrToken" TEXT,
    "qrExpiresAt" TIMESTAMP(3),
    "routeOrder" INTEGER,
    "payoutAmount" INTEGER,
    "collectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickupRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cluster" (
    "id" TEXT NOT NULL,
    "zoneType" "ZoneType" NOT NULL,
    "zoneKey" TEXT NOT NULL,
    "status" "ClusterStatus" NOT NULL DEFAULT 'OPEN',
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "totalValue" INTEGER NOT NULL DEFAULT 0,
    "densityThreshold" INTEGER NOT NULL DEFAULT 5,
    "centroidLat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "centroidLng" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agentId" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TxnType" NOT NULL,
    "reason" "TxnReason" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "pickupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WasteItem_s3Key_key" ON "WasteItem"("s3Key");

-- CreateIndex
CREATE INDEX "WasteItem_imageHash_idx" ON "WasteItem"("imageHash");

-- CreateIndex
CREATE UNIQUE INDEX "PickupRequest_itemId_key" ON "PickupRequest"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "PickupRequest_qrToken_key" ON "PickupRequest"("qrToken");

-- CreateIndex
CREATE INDEX "PickupRequest_userId_idx" ON "PickupRequest"("userId");

-- CreateIndex
CREATE INDEX "PickupRequest_clusterId_idx" ON "PickupRequest"("clusterId");

-- CreateIndex
CREATE INDEX "Cluster_zoneType_zoneKey_status_idx" ON "Cluster"("zoneType", "zoneKey", "status");

-- CreateIndex
CREATE INDEX "Cluster_agentId_idx" ON "Cluster"("agentId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- AddForeignKey
ALTER TABLE "WasteItem" ADD CONSTRAINT "WasteItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupRequest" ADD CONSTRAINT "PickupRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupRequest" ADD CONSTRAINT "PickupRequest_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "WasteItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupRequest" ADD CONSTRAINT "PickupRequest_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Cluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cluster" ADD CONSTRAINT "Cluster_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
