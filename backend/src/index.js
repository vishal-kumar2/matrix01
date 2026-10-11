require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ZodError } = require('zod');
const { AppError } = require('./lib/errors');

const required = ['DATABASE_URL', 'AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET', 'WEBHOOK_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) console.warn(`[warn] missing env vars: ${missing.join(', ')}`);

const app = express();

const origins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000').split(',').map((s) => s.trim().replace(/\/$/, ''));
app.use(cors({ origin: (origin, cb) => cb(null, !origin || origins.includes(origin)) }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use(require('./routes/users'));
app.use(require('./routes/pickups'));
app.use(require('./routes/webhooks'));
app.use(require('./routes/clusters'));
app.use(require('./routes/collect'));

app.use((req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: `No route ${req.method} ${req.path}` } }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') },
    });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
});

const port = process.env.PORT || 4000;
app.listen(port, '0.0.0.0', () => console.log(`API listening on :${port}`));
