const router = require('express').Router();
const { asyncHandler } = require('../lib/errors');
const { collect } = require('../services/walletService');

router.post('/collect', asyncHandler(async (req, res) => {
  res.json(await collect(req.body));
}));

module.exports = router;
