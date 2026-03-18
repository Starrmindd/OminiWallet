# OmniWallet

> One login. All wallets. Any device. Full control.

A production-ready, non-custodial multi-chain wallet aggregator. Connect and manage Ethereum, Polygon, BNB Chain, Arbitrum, Solana, and Bitcoin wallets from a single interface.

---

## Architecture

```
omniwallet/
├── apps/
│   ├── web/          Next.js 14 frontend (TypeScript + Tailwind)
│   └── api/          NestJS backend (REST + WebSockets)
├── packages/
│   ├── blockchain/   Chain integrations (ethers.js, @solana/web3.js, bitcoinjs-lib)
│   └── utils/        Shared types, encryption, formatting, validation
└── docker-compose.yml
```

## Security Model

- **Non-custodial**: Private keys never leave the user's device
- **AES-256 encryption**: Keys encrypted client-side with user password + device key before any server interaction
- **JWT auth**: Short-lived access tokens (15m) + refresh tokens (7d), hashed in DB
- **2FA**: TOTP support via authenticator apps
- **Rate limiting**: 100 req/15min per IP
- **Helmet**: Secure HTTP headers on all API responses

---

## Quick Start

### Prerequisites
- Node.js 18+
- Docker + Docker Compose

### 1. Clone and install

```bash
git clone <repo>
cd omniwallet
cp .env.example .env
# Edit .env with your RPC URLs and secrets
npm install
```

### 2. Start with Docker (recommended)

```bash
docker-compose up -d
```

- Frontend: http://localhost:3000
- API: http://localhost:4000/api/v1

### 3. Local development

```bash
# Terminal 1 — start Postgres + Redis
docker-compose up postgres redis -d

# Terminal 2 — API
cd apps/api
npm run dev

# Terminal 3 — Web
cd apps/web
npm run dev
```

---

## API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register with email + password |
| POST | `/api/v1/auth/login` | Login (supports TOTP) |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/profile` | Get current user |
| POST | `/api/v1/auth/totp/setup` | Generate TOTP secret |
| POST | `/api/v1/auth/totp/enable` | Verify and enable 2FA |

### Wallets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/wallets` | List user wallets |
| POST | `/api/v1/wallets` | Add wallet (address or encrypted key) |
| PUT | `/api/v1/wallets/:id` | Update wallet label |
| DELETE | `/api/v1/wallets/:id` | Remove wallet |
| GET | `/api/v1/wallets/:id/key` | Retrieve encrypted key blob |

### Portfolio

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/portfolio` | Aggregated portfolio with USD values |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/transactions/wallet/:id` | Transaction history |
| POST | `/api/v1/transactions/wallet/:id/estimate` | Gas estimation (EVM) |
| POST | `/api/v1/transactions/wallet/:id/simulate` | Transaction simulation |

---

## Environment Variables

See `.env.example` for all required variables. Key ones:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=<32+ char random string>
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/<key>
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## Deployment

### Frontend → Vercel
```bash
cd apps/web
vercel deploy
```

### Backend → Railway / Render
Point to `apps/api`, set env vars, deploy. Both support Postgres and Redis add-ons.

### Full stack → Docker
```bash
docker-compose up --build -d
```

---

## Supported Chains

| Chain | Type | Native Token |
|-------|------|-------------|
| Ethereum | EVM | ETH |
| Polygon | EVM | MATIC |
| BNB Chain | EVM | BNB |
| Arbitrum One | EVM | ETH |
| Solana | SVM | SOL |
| Bitcoin | UTXO | BTC |

---

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand, TanStack Query, Framer Motion
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, Socket.io
- **Blockchain**: ethers.js v6, @solana/web3.js, bitcoinjs-lib
- **Auth**: JWT, bcrypt, TOTP (speakeasy)
- **Encryption**: AES-256 (crypto-js), PBKDF2 key derivation
