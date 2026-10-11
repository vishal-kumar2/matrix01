const { z } = require('zod');
const prisma = require('../lib/prisma');
const { estimateValue } = require('./pricing');
const clusterService = require('./clusterService');

const MIN_CONFIDENCE = 80;

const webhookSchema = z.object({
  s3Key: z.string().min(1),
  isEwaste: z.boolean(),
  confidence: z.number().default(0),
  topLabel: z.string().nullable().optional(),
  labels: z.array(z.any()).optional(),
  imageHash: z.string().nullable().optional(),
});

async function handleVerification(body) {
  const data = webhookSchema.parse(body);
  const imageHash = data.imageHash ? data.imageHash.replace(/"/g, '') : null;

  const item = await prisma.wasteItem.findUnique({ where: { s3Key: data.s3Key }, include: { pickup: true } });
  if (!item || !item.pickup) return { ignored: true, reason: 'unknown key' };
  if (item.status !== 'PENDING') return { ignored: true, reason: 'already processed' };

  // decide
  let rejectionReason = null;
  if (imageHash && process.env.DISABLE_DUPLICATE_CHECK !== 'true') {
    const dup = await prisma.wasteItem.findFirst({ where: { imageHash, id: { not: item.id } } });
    if (dup) rejectionReason = 'This photo has already been used for another pickup.';
  }
  if (!rejectionReason && !(data.isEwaste && data.confidence >= MIN_CONFIDENCE)) {
    rejectionReason = data.isEwaste
      ? `We are not confident enough this is e-waste (${data.topLabel}, ${Math.round(data.confidence)}%). Try a clearer photo.`
      : 'We could not detect an electronic item in this photo. Please retake it.';
  }

  const common = { detectedLabel: data.topLabel ?? null, confidence: data.confidence };

  return prisma.$transaction(
    async (tx) => {
      if (rejectionReason) {
        const claimed = await tx.wasteItem.updateMany({
          where: { id: item.id, status: 'PENDING' },
          data: { ...common, status: 'REJECTED', rejectionReason },
        });
        if (claimed.count === 0) return { ignored: true, reason: 'already processed' };
        await tx.pickupRequest.update({ where: { id: item.pickup.id }, data: { status: 'REJECTED' } });
        return { status: 'REJECTED', reason: rejectionReason };
      }

      const value = estimateValue(item.category, item.condition);
      const claimed = await tx.wasteItem.updateMany({
        where: { id: item.id, status: 'PENDING' },
        data: { ...common, status: 'VERIFIED', imageHash, estimatedValue: value },
      });
      if (claimed.count === 0) return { ignored: true, reason: 'already processed' };

      const cluster = await clusterService.assign(tx, item.pickup, value);
      return { status: 'VERIFIED', estimatedValue: value, clusterId: cluster.id, clusterStatus: cluster.status };
    },
    { timeout: 20000, maxWait: 10000 }
  );
}

module.exports = { handleVerification };
