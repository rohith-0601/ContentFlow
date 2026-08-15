# ContentFlow

AI-powered CMS and Sprint Tracking tool.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **AI**: OpenAI API

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set:

- `MONGODB_URI` — your MongoDB connection string
- `OPENAI_API_KEY` — your OpenAI API key

### 3. Seed the database

```bash
npm run seed
```

### 4. Start development servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5001

## Project Structure

```
ContentFlow/
  client/          # React frontend
    src/
      components/  # Reusable UI components
      pages/       # Page-level components
      lib/         # API helpers
  server/          # Express backend
    src/
      models/      # Mongoose schemas
      routes/      # API route handlers
      seed.js      # Database seed script
```
