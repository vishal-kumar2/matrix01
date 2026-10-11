const crypto = require('crypto');
const { z } = require('zod');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const prisma = require('../lib/prisma');
const s3 = require('../lib/s3');
const { AppError } = require('../lib/errors');
const { CATEGORIES, CONDITIONS } = require('./pricing');

const createSchema = z.object({
  userId: z.string().min(1),
  category: z.string().transform((s) => s.toLowerCase()).pipe(z.enum(CATEGORIES)),
  condition: z.string().transform((s) => s.toUpperCase()).pipe(z.enum(CONDITIONS)),
  conditionForm: z.record(z.any()).default({}),
  contentType: z.enum(['image/jpeg', 'image/png']),
});

async function createPickup(body) {
  const data = createSchema.parse(body);
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);

  const ext = data.contentType === 'image/png' ? 'png' : 'jpg';
  const s3Key = `uploads/${user.id}/${crypto.randomUUID()}.${ext}`;

  const pickup = await prisma.$transaction(async (tx) => {
    const item = await tx.wasteItem.create({
      data: {
        userId: user.id,
        category: data.category,
        condition: data.condition,
        conditionForm: data.conditionForm,
        s3Key,
        contentType: data.contentType,
        status: 'PENDING',
      },
    });
    return tx.pickupRequest.create({
      data: {
        userId: user.id,
        itemId: item.id,
        status: 'AWAITING_VERIFICATION',
        address: user.address,
        lat: user.lat,
        lng: user.lng,
        hostelCode: user.hostelCode,
        pinCode: user.pinCode,
      },
    });
  });

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: s3Key, ContentType: data.contentType }),
    { expiresIn: 300 }
  );

  return { pickupId: pickup.id, uploadUrl, s3Key };
}

function shapePickup(p, { includeQr = true } = {}) {
  return {
    id: p.id,
    status: p.status,
    address: p.address,
    createdAt: p.createdAt,
    item: {
      category: p.item.category,
      condition: p.item.condition,
      label: p.item.detectedLabel,
      confidence: p.item.confidence,
      estimatedValue: p.item.estimatedValue,
      rejectionReason: p.item.rejectionReason,
    },
    cluster: p.cluster
      ? {
          id: p.cluster.id,
          status: p.cluster.status,
          requestCount: p.cluster.requestCount,
          densityThreshold: p.cluster.densityThreshold,
          scheduledFor: p.cluster.scheduledFor,
        }
      : null,
    qrToken: includeQr && ['SCHEDULED'].includes(p.status) ? p.qrToken : null,
    qrExpiresAt: includeQr && p.status === 'SCHEDULED' ? p.qrExpiresAt : null,
    payoutAmount: p.payoutAmount,
  };
}

async function getPickup(id) {
  const p = await prisma.pickupRequest.findUnique({ where: { id }, include: { item: true, cluster: true } });
  if (!p) throw new AppError('PICKUP_NOT_FOUND', 'Pickup not found', 404);
  return shapePickup(p);
}

async function listUserPickups(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  const list = await prisma.pickupRequest.findMany({
    where: { userId },
    include: { item: true, cluster: true },
    orderBy: { createdAt: 'desc' },
  });
  return list.map((p) => shapePickup(p, { includeQr: false }));
}

module.exports = { createPickup, getPickup, listUserPickups };
