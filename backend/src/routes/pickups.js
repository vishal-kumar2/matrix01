const router = require('express').Router();
const { asyncHandler } = require('../lib/errors');
const { createPickup, getPickup } = require('../services/pickupService');

router.post('/pickups', asyncHandler(async (req, res) => {
  res.status(201).json(await createPickup(req.body));
}));

router.get('/pickups/:id', asyncHandler(async (req, res) => {
  res.json(await getPickup(req.params.id));
}));

module.exports = router;
