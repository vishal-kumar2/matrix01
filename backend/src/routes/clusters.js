const router = require('express').Router();
const { asyncHandler } = require('../lib/errors');
const { listAgentClusters, getCluster } = require('../services/clusterService');

router.get('/agents/:id/clusters', asyncHandler(async (req, res) => {
  res.json(await listAgentClusters(req.params.id));
}));

router.get('/clusters/:id', asyncHandler(async (req, res) => {
  res.json(await getCluster(req.params.id));
}));

module.exports = router;
