const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { AppError } = require('../lib/errors');

const THRESHOLD = () => parseInt(process.env.DENSITY_THRESHOLD || '5', 10);
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function zoneFor(request) {
  return request.hostelCode
    ? { zoneType: 'CAMPUS_HOSTEL', zoneKey: request.hostelCode }
    : { zoneType: 'PIN_CODE', zoneKey: request.pinCode };
}

// tomorrow 10:00 IST, expressed as a UTC Date
function tomorrowTenIST() {
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + 1, 10, 0, 0) - IST_OFFSET_MS);
}

function distanceKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestNeighbourOrder(stops, start) {
  const remaining = [...stops];
  const ordered = [];
  let current = start;
  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = distanceKm(current, s);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    const [next] = remaining.splice(bestIdx, 1);
    ordered.push(next);
    current = next;
  }
  return ordered;
}

async function schedule(tx, cluster, members) {
  const agent = await tx.user.findFirst({ where: { role: 'AGENT' }, orderBy: { createdAt: 'asc' } });
  if (!agent) throw new AppError('NO_AGENT', 'No agent exists. Run npm run seed.', 500);

  const scheduledFor = tomorrowTenIST();
  const qrExpiresAt = new Date(scheduledFor.getTime() + 24 * 60 * 60 * 1000);
  const ordered = nearestNeighbourOrder(members, { lat: cluster.centroidLat, lng: cluster.centroidLng });

  for (let i = 0; i < ordered.length; i++) {
    await tx.pickupRequest.update({
      where: { id: ordered[i].id },
      data: {
        status: 'SCHEDULED',
        qrToken: crypto.randomBytes(16).toString('hex'),
        qrExpiresAt,
        routeOrder: i + 1,
      },
    });
  }
  return tx.cluster.update({
    where: { id: cluster.id },
    data: { status: 'SCHEDULED', agentId: agent.id, scheduledFor },
  });
}

// Must be called inside a prisma.$transaction
async function assign(tx, request, value) {
  const { zoneType, zoneKey } = zoneFor(request);

  // serialise pooling per zone so two webhooks can't create two OPEN clusters
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${zoneType + ':' + zoneKey}))`;

  let cluster = await tx.cluster.findFirst({ where: { zoneType, zoneKey, status: 'OPEN' } });
  if (!cluster) {
    cluster = await tx.cluster.create({
      data: { zoneType, zoneKey, densityThreshold: THRESHOLD(), centroidLat: request.lat, centroidLng: request.lng },
    });
  }

  await tx.pickupRequest.update({ where: { id: request.id }, data: { clusterId: cluster.id, status: 'POOLED' } });

  const members = await tx.pickupRequest.findMany({ where: { clusterId: cluster.id } });
  const centroidLat = members.reduce((s, m) => s + m.lat, 0) / members.length;
  const centroidLng = members.reduce((s, m) => s + m.lng, 0) / members.length;

  let updated = await tx.cluster.update({
    where: { id: cluster.id },
    data: { requestCount: { increment: 1 }, totalValue: { increment: value }, centroidLat, centroidLng },
  });

  if (updated.requestCount >= updated.densityThreshold) {
    updated = await schedule(tx, updated, members);
  }
  return updated;
}

// ---------- reads for the agent dashboard ----------
async function listAgentClusters(agentId) {
  const clusters = await prisma.cluster.findMany({
    where: { agentId, status: { in: ['SCHEDULED', 'COMPLETED'] } },
    include: { requests: { select: { status: true } } },
    orderBy: { scheduledFor: 'asc' },
  });
  return clusters.map((c) => ({
    id: c.id,
    zoneType: c.zoneType,
    zoneKey: c.zoneKey,
    status: c.status,
    requestCount: c.requestCount,
    collectedCount: c.requests.filter((r) => r.status === 'COLLECTED').length,
    totalValue: c.totalValue,
    scheduledFor: c.scheduledFor,
    centroid: { lat: c.centroidLat, lng: c.centroidLng },
  }));
}

async function getCluster(id) {
  const c = await prisma.cluster.findUnique({
    where: { id },
    include: { requests: { include: { item: true, user: true }, orderBy: { routeOrder: 'asc' } } },
  });
  if (!c) throw new AppError('CLUSTER_NOT_FOUND', 'Cluster not found', 404);
  return {
    id: c.id,
    zoneType: c.zoneType,
    zoneKey: c.zoneKey,
    status: c.status,
    agentId: c.agentId,
    scheduledFor: c.scheduledFor,
    totalValue: c.totalValue,
    requestCount: c.requestCount,
    centroid: { lat: c.centroidLat, lng: c.centroidLng },
    stops: c.requests.map((r) => ({
      pickupId: r.id,
      routeOrder: r.routeOrder,
      lat: r.lat,
      lng: r.lng,
      address: r.address,
      userName: r.user.name,
      item: { category: r.item.category, label: r.item.detectedLabel, estimatedValue: r.item.estimatedValue },
      status: r.status,
    })),
  };
}

module.exports = { assign, listAgentClusters, getCluster };
