const router = require('express').Router();
const prisma = require('../lib/prisma');
const { asyncHandler } = require('../lib/errors');
const { listUserPickups } = require('../services/pickupService');
const { getWallet } = require('../services/walletService');

router.get('/users', asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, role: true, hostelCode: true, pinCode: true, address: true },
    orderBy: [{ role: 'desc' }, { name: 'asc' }],
  });
  res.json(users);
}));

router.get('/users/:id/pickups', asyncHandler(async (req, res) => {
  res.json(await listUserPickups(req.params.id));
}));

router.get('/users/:id/wallet', asyncHandler(async (req, res) => {
  res.json(await getWallet(req.params.id));
}));

module.exports = router;
