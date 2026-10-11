# E-waste Backend (Person B)

Express + Prisma + Postgres. All amounts in **paise** (integers).

## 1. Local setup (light on RAM: no Docker, DB is hosted)
```bash
npm install
cp .env.example .env     # fill values (Windows: copy .env.example .env)
npx prisma migrate dev --name init   # creates tables + prisma/migrations (commit it)
npm run seed
npm run dev              # http://localhost:4000/health
```
Quick alternative to migrations: `npx prisma db push`.

## 2. Deploy (Render)
- New Web Service -> connect repo
- Build command: `npm install && npx prisma migrate deploy`
- Start command: `npm start`
- Add every variable from `.env.example` in Render's Environment tab.
- Then run `npm run seed` once (Render Shell, or locally with the same DATABASE_URL).
- Share the public URL with A and C. Ping `/health` one minute before the demo.

## 3. Test everything with curl (no frontend needed)
```bash
API=http://localhost:4000
curl $API/users                       # copy a hostel-H1 student id (Rohan) and the agent id

# create pickup
curl -X POST $API/pickups -H "Content-Type: application/json" -d '{
 "userId":"STUDENT_ID","category":"phone","condition":"DEAD",
 "conditionForm":{"screenCracked":true},"contentType":"image/jpeg"}'
# -> note pickupId and s3Key

# fake the Lambda
curl -X POST $API/webhooks/verification -H "Content-Type: application/json" \
 -H "x-webhook-secret: YOUR_SECRET" -d '{
 "s3Key":"S3KEY","isEwaste":true,"confidence":97.4,"topLabel":"Mobile Phone",
 "labels":[{"Name":"Mobile Phone","Confidence":97.4}],"imageHash":"abc123"}'

curl $API/pickups/PICKUP_ID           # SCHEDULED + qrToken (5th request in H1)
curl -X POST $API/collect -H "Content-Type: application/json" \
 -d '{"qrToken":"QR_TOKEN","agentId":"AGENT_ID"}'
curl $API/users/STUDENT_ID/wallet
curl $API/agents/AGENT_ID/clusters
```

## Endpoints
GET /users, POST /pickups, GET /pickups/:id, GET /users/:id/pickups, GET /users/:id/wallet,
POST /webhooks/verification, GET /agents/:id/clusters, GET /clusters/:id, POST /collect, GET /health

Errors: `{ "error": { "code": "QR_EXPIRED", "message": "..." } }`
Codes: VALIDATION_ERROR, UNAUTHORIZED, USER_NOT_FOUND, PICKUP_NOT_FOUND, CLUSTER_NOT_FOUND,
QR_NOT_FOUND, ALREADY_COLLECTED, NOT_SCHEDULED, QR_EXPIRED, WRONG_AGENT.

## Notes
- Duplicate-photo check uses S3 ETag. While rehearsing with the same photo set `DISABLE_DUPLICATE_CHECK=true`.
- Rekognition confidence must be >= 80 to verify.
- Re-seed between rehearsals: `npm run seed`.

## Neon + Render quick guide
1. neon.tech -> new project, region **AWS US East (N. Virginia)**. Copy the pooled string to DATABASE_URL and the direct one to DIRECT_URL.
2. Locally: `npx prisma migrate dev --name init` then `npm run seed`. Commit the `prisma/migrations` folder (Render's build runs `migrate deploy`, which needs it).
3. Push to GitHub -> Render -> New -> Blueprint (uses render.yaml) or Web Service with the same commands. Region Virginia.
4. Fill env vars in Render. S3_BUCKET and FRONTEND_ORIGIN can be added later: edit the variable in Render and it redeploys. No code change.
5. Free tier sleeps after ~15 min: add a free UptimeRobot monitor on `https://YOUR-APP.onrender.com/health` every 5 min.
