require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { estimateValue } = require('../src/services/pricing');
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

// >>> Replace with your campus coordinates. Offsets are ~50-300 m apart. <<<
const BASE = {
  lat: parseFloat(process.env.SEED_LAT || '28.545'),
  lng: parseFloat(process.env.SEED_LNG || '77.19'),
};
const PIN = process.env.SEED_PIN || '110016';
const HOSTEL = process.env.SEED_HOSTEL || 'H1';
const at = (dLat, dLng) => ({ lat: BASE.lat + dLat, lng: BASE.lng + dLng });

const students = [
  { name: 'Aarav Sharma', room: '101', ...at(0.0004, 0.0003), category: 'phone', condition: 'DEAD', label: 'Mobile Phone' },
  { name: 'Diya Verma', room: '114', ...at(0.0008, -0.0006), category: 'laptop', condition: 'DAMAGED', label: 'Laptop' },
  { name: 'Kabir Singh', room: '208', ...at(-0.0005, 0.0012), category: 'battery', condition: 'DEAD', label: 'Battery' },
  { name: 'Meera Iyer', room: '215', ...at(0.0015, 0.0004), category: 'charger', condition: 'WORKING', label: 'Adapter' },
  // these two are for the live demo (not pre-filled)
  { name: 'Rohan Gupta', room: '303', ...at(-0.0012, -0.0009) },
  { name: 'Sana Khan', room: '310', ...at(0.0011, 0.0016) },
];
const households = [
  { name: 'Mrs. Kapoor', address: 'B-12, Sector 4 (Household)', ...at(0.0026, 0.0021) },
  { name: 'Mr. Menon', address: 'C-7, Sector 4 (Household)', ...at(-0.0022, 0.0027) },
];

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.pickupRequest.deleteMany();
  await prisma.wasteItem.deleteMany();
  await prisma.cluster.deleteMany();
  await prisma.user.deleteMany();

  const agent = await prisma.user.create({
    data: { name: 'Ravi (Pickup Agent)', role: 'AGENT', pinCode: PIN, address: 'Collection Hub', ...at(0, 0) },
  });

  const created = [];
  for (const s of students) {
    created.push(
      await prisma.user.create({
        data: { name: s.name, hostelCode: HOSTEL, pinCode: PIN, address: `Room ${s.room}, Hostel ${HOSTEL}`, lat: s.lat, lng: s.lng },
      })
    );
  }
  for (const h of households) {
    await prisma.user.create({ data: { name: h.name, pinCode: PIN, address: h.address, lat: h.lat, lng: h.lng } });
  }

  // Hostel cluster pre-filled to 4 of 5
  const prefilled = students.slice(0, 4);
  const centroidLat = prefilled.reduce((s, p) => s + p.lat, 0) / 4;
  const centroidLng = prefilled.reduce((s, p) => s + p.lng, 0) / 4;
  const values = prefilled.map((p) => estimateValue(p.category, p.condition));

  const cluster = await prisma.cluster.create({
    data: {
      zoneType: 'CAMPUS_HOSTEL',
      zoneKey: HOSTEL,
      status: 'OPEN',
      requestCount: 4,
      totalValue: values.reduce((a, b) => a + b, 0),
      densityThreshold: parseInt(process.env.DENSITY_THRESHOLD || '5', 10),
      centroidLat,
      centroidLng,
    },
  });

  for (let i = 0; i < prefilled.length; i++) {
    const p = prefilled[i];
    const u = created[i];
    const item = await prisma.wasteItem.create({
      data: {
        userId: u.id, category: p.category, condition: p.condition, conditionForm: {},
        s3Key: `seed/${u.id}.jpg`, contentType: 'image/jpeg', status: 'VERIFIED',
        detectedLabel: p.label, confidence: 95, estimatedValue: values[i],
      },
    });
    await prisma.pickupRequest.create({
      data: {
        userId: u.id, itemId: item.id, status: 'POOLED', address: u.address, lat: u.lat, lng: u.lng,
        hostelCode: HOSTEL, pinCode: PIN, clusterId: cluster.id,
      },
    });
  }

  console.log('Seed done.');
  console.log(`Agent id: ${agent.id}`);
  console.log(`Hostel ${HOSTEL} cluster is at 4/5 - next verified request from ${HOSTEL} triggers scheduling.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
