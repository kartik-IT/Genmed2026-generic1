# Low & Best Medicine Generics

> Cost-aware bioequivalent medicine discovery, clinical comparison, pharmacy stock verification, and digital savings pass platform.

## Project Structure

This is a **monorepo with separated frontend and backend**:

```
project-root/
├── frontend/                 # React 19 + Vite 6 frontend application
│   ├── src/                 # React components, hooks, API clients, styles
│   ├── public/              # Static assets, manifest, service worker, icons
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.ts       # Vite build configuration with API proxy
│   ├── tsconfig.json        # TypeScript config for frontend
│   └── .env.example         # Frontend environment variables template
│
├── backend/                  # Express.js API server
│   ├── src/                 # Express routes, middleware, services, types
│   ├── package.json         # Backend dependencies
│   ├── tsconfig.json        # TypeScript config for backend
│   └── .env.example         # Backend environment variables template
│
├── docs/                     # Documentation
│   └── launch-checklist.md  # Production deployment checklist
│
├── .github/                  # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml           # Automated lint → test → build → docker
│       └── deploy.yml       # Manual staging/production deployment
│
├── README.md                 # This file
├── package.json             # Root workspace (for monorepo tooling if needed)
└── .gitignore               # Git ignore rules
```

---

## Tech Stack

### Frontend
- **React 19** — Component-based UI framework
- **Vite 6** — Fast build tool with HMR
- **TypeScript** — Type safety
- **TailwindCSS v4** — Utility-first CSS framework
- **Motion** — Animation library
- **Lucide React** — Icon library

### Backend
- **Express.js** — HTTP server framework
- **TypeScript** — Type safety
- **Gemini AI** — AI-powered drug search
- **OpenFDA API** — Drug database integration
- **OIDC** — OpenID Connect authentication

---

## Quick Start

### Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **npm** 10+ (comes with Node.js)

### 1. Install Dependencies

**Frontend dependencies:**
```bash
cd frontend
npm install
```

**Backend dependencies:**
```bash
cd ../backend
npm install
```

### 2. Configure Environment Variables

**Frontend (`frontend/.env`):**
```bash
cp frontend/.env.example frontend/.env
# Edit if needed; defaults work for local development
```

**Backend (`backend/.env`):**
```bash
cp backend/.env.example backend/.env
# At minimum, configure:
# - GEMINI_API_KEY (for AI features)
# - OIDC_* variables (for authentication, optional)
```

### 3. Start Development Servers

**Terminal 1 — Start the backend:**
```bash
cd backend
npm run dev
```
Backend will run at **http://localhost:3001**

**Terminal 2 — Start the frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run at **http://localhost:3000**

The frontend is configured to proxy `/api/*` requests to the backend at `http://localhost:3001`.

### 4. Access the Application

Open your browser and navigate to **http://localhost:3000**

---

## Development Scripts

### Frontend

```bash
cd frontend

# Start development server with hot-reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# TypeScript type-checking
npm run lint
```

### Backend

```bash
cd backend

# Start development server with auto-restart on file changes
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production server (requires build first)
npm start

# Run backend tests
npm test
```

---

## Running Both Together

### Option 1: Using npm concurrently (from root)

```bash
# At project root, install concurrently if not already installed
npm install -D concurrently

# Run both simultaneously
concurrently "npm run dev --prefix backend" "npm run dev --prefix frontend"
```

### Option 2: Manual terminal approach

Open two terminal windows:

**Terminal 1:**
```bash
cd backend && npm run dev
```

**Terminal 2:**
```bash
cd frontend && npm run dev
```

---

## API Communication

The frontend communicates with the backend exclusively through HTTP API calls:

### Proxy Configuration

The frontend's `vite.config.ts` automatically proxies all `/api/*` requests to the backend during development:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  }
}
```

### Backend Port Customization

To use a different backend port, set environment variables:

**Frontend (`frontend/.env`):**
```env
VITE_BACKEND_PORT=3001
VITE_BACKEND_URL=http://localhost:3001
```

The backend reads `PORT` from `backend/.env` or environment.

---

## Project Features

### Implemented (Phases 1–7) ✅

- **Search Screen** — Drug discovery with AI-powered search
- **Compare Screen** — Bioequivalent generic comparison
- **Pharmacies Screen** — Nearby pharmacy listing with stock/pricing
- **Saved Rx Screen** — Prescription tracking with refill alerts
- **Authentication** — OIDC 2.0 with server-side session management
- **PWA** — Service worker, offline-first caching, push notifications, install prompt
- **Accessibility** — Focus traps, ARIA, semantic HTML, `prefers-color-scheme`, `prefers-reduced-motion`
- **Error Reporting** — Client-side error capture → `/api/errors` ingestion
- **CI/CD** — GitHub Actions for lint → test → build → docker
- **8 Themes** — Clinical Teal, Midnight Dark, Nordic Sage, Sapphire Care, Amethyst Therapy, Warm Terracotta, Compassion Rose, Obsidian Matrix

### Pending (Database persistence, HIPAA compliance, etc.)

See `docs/launch-checklist.md` for production requirements.

---

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_BACKEND_URL` | `http://localhost:3001` | Backend API URL |
| `VITE_BACKEND_PORT` | `3001` | Backend port for proxy |
| `DISABLE_HMR` | `false` | Disable HMR (AI Studio) |

### Backend (`backend/.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3001` | Express server port |
| `APP_URL` | `http://localhost:3000` | Frontend URL (CORS) |
| `GEMINI_API_KEY` | *(empty)* | Google Gemini AI key |
| `OIDC_ISSUER` | *(empty)* | OpenID Connect provider |
| `OIDC_CLIENT_ID` | *(empty)* | OIDC client ID |
| `OIDC_CLIENT_SECRET` | *(empty)* | OIDC client secret |
| `VAPID_PUBLIC_KEY` | *(empty)* | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | *(empty)* | Web Push VAPID private key |

See `frontend/.env.example` and `backend/.env.example` for complete lists.

---

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

**Frontend on a different port:**
```bash
cd frontend
npm run dev -- --port 5173
```

**Backend on a different port:**
```bash
cd backend
PORT=3002 npm run dev
```

Then update `frontend/.env` to point to the correct backend:
```env
VITE_BACKEND_URL=http://localhost:3002
```

### Frontend Can't Connect to Backend

1. Ensure backend is running: `http://localhost:3001/api/health` should respond with `{ status: "ok" }`
2. Check `frontend/.env` has correct `VITE_BACKEND_URL`
3. Check browser console for CORS errors
4. Verify backend is listening: `netstat -an | findstr 3001` (Windows) or `lsof -i :3001` (Mac/Linux)

### TypeScript Errors

Run type-checking:
```bash
cd frontend && npm run lint
cd backend && npm run lint
```

### Dependencies Not Installed

Delete `node_modules` and `package-lock.json`, then reinstall:
```bash
cd frontend && rm -r node_modules package-lock.json && npm install
cd ../backend && rm -r node_modules package-lock.json && npm install
```

---

## Build & Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

**Backend:**
```bash
cd backend
npm run build
# Output: backend/build/
```

### Docker (Backend)

```bash
docker build -t genmed-api .
docker run -p 3001:3001 --env-file backend/.env genmed-api
```

See `Dockerfile` for production container configuration.

---

## Documentation

- **[Phase Roadmap](./phase.md)** — Development phases and current status
- **[Project Memory](./memory.md)** — Architecture, decisions, and technical notes
- **[Launch Checklist](./docs/launch-checklist.md)** — Production deployment requirements
- **[Architecture Decisions](./decisions.md)** — Key design rationale
- **[Project Rules](./rules.md)** — Coding standards and conventions

---

## Contributing

1. Create a branch: `git checkout -b feature/my-feature`
2. Make changes in either `frontend/` or `backend/`
3. Run type-checking: `npm run lint` in the appropriate directory
4. Commit with a clear message: `git commit -m "feat: add new feature"`
5. Push and open a pull request

See `rules.md` for coding conventions and `decisions.md` for architectural context.

---

## License

Apache License 2.0 — See [LICENSE](./LICENSE) for details.

---

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the documentation files (`phase.md`, `memory.md`, `decisions.md`)
- Inspect the `.env.example` files for configuration help

---

*Last updated: 2026-09-09*
