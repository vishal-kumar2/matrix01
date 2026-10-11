const crypto = require('crypto');
const router = require('express').Router();
const { asyncHandler, AppError } = require('../lib/errors');
const { handleVerification } = require('../services/verificationService');

function secretOk(provided) {
  const expected = process.env.WEBHOOK_SECRET || '';
  if (!expected || typeof provided !== 'string') return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

router.post('/webhooks/verification', asyncHandler(async (req, res) => {
  if (!secretOk(req.get('x-webhook-secret'))) throw new AppError('UNAUTHORIZED', 'Invalid webhook secret', 401);
  res.status(200).json(await handleVerification(req.body));
}));

module.exports = router;
