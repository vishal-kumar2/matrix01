# E-waste reverse-logistics engine

## First-time setup

    cd backend
    npm install
    cp .env.example .env        # then fill in DATABASE_URL
    npx prisma migrate dev --name init

    cd ../frontend
    npm install
    cp .env.example .env.local

## Run (two terminals)

    cd backend && npm run dev      # http://localhost:4000/health
    cd frontend && npm run dev     # http://localhost:3000

Never commit `.env` or `.env.local`.
