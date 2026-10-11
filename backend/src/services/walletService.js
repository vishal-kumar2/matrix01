const crypto = require('crypto');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { AppError } = require('../lib/errors');

const collectSchema = z.object({ qrToken: z.string().min(1), agentId: z.string().min(1) });

async function getWallet(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);
  const transactions = await prisma.transaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return { balance: user.walletBalance, transactions };
}

async function collect(body) {
  const { qrToken, agentId } = collectSchema.parse(body);

  const req = await prisma.pickupRequest.findUnique({
    where: { qrToken },
    include: { cluster: true, item: true, user: true },
  });
  if (!req) throw new AppError('QR_NOT_FOUND', 'This QR code is not valid.', 404);
  if (req.status === 'COLLECTED') throw new AppError('ALREADY_COLLECTED', 'This pickup was already collected.', 409);
  if (req.status !== 'SCHEDULED') throw new AppError('NOT_SCHEDULED', 'This pickup is not scheduled yet.', 409);
  if (req.qrExpiresAt && req.qrExpiresAt < new Date()) throw new AppError('QR_EXPIRED', 'This QR code has expired.', 410);
  if (!req.cluster || req.cluster.agentId !== agentId) {
    throw new AppError('WRONG_AGENT', 'This pickup is assigned to a different agent.', 403);
  }

  const amount = req.item.estimatedValue ?? 0;

  return prisma.$transaction(async (tx) => {
    const claimed = await tx.pickupRequest.updateMany({
      where: { id: req.id, status: 'SCHEDULED' },
      data: { status: 'COLLECTED', collectedAt: new Date(), payoutAmount: amount },
    });
    if (claimed.count === 0) throw new AppError('ALREADY_COLLECTED', 'This pickup was already collected.', 409);

    const user = await tx.user.update({ where: { id: req.userId }, data: { walletBalance: { increment: amount } } });

    await tx.transaction.create({
      data: {
        userId: user.id,
        type: 'CREDIT',
        reason: 'PICKUP_PAYOUT',
        amount,
        balanceAfter: user.walletBalance,
        reference: `UPI${Date.now()}${crypto.randomInt(1000, 9999)}`,
        pickupId: req.id,
      },
    });

    const remaining = await tx.pickupRequest.count({
      where: { clusterId: req.clusterId, status: { not: 'COLLECTED' } },
    });
    if (remaining === 0) {
      await tx.cluster.update({ where: { id: req.clusterId }, data: { status: 'COMPLETED' } });
    }

    return {
      pickupId: req.id,
      userName: req.user.name,
      amount,
      balance: user.walletBalance,
      clusterCompleted: remaining === 0,
    };
  });
}

module.exports = { getWallet, collect };
