# 🌌 Project Orion — Digital Content Platform

> Premium Arabic digital library with AI-powered discovery.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | NestJS, TypeORM, MySQL 8 |
| **Cache** | Redis 7 |
| **Search** | Elasticsearch (Sprint 8) |
| **Cloud** | AWS (ECS Fargate, S3, CloudFront) |

## Getting Started

### Prerequisites
- **Node.js** >= 18
- **Docker** & Docker Compose
- **npm** >= 9

### 1. Start Infrastructure
```bash
docker-compose up -d
```
This starts MySQL (port 3306), Redis (port 6379), and Adminer (port 8080).

### 2. Start Backend
```bash
cd backend
npm install
npm run start:dev
```
API available at `http://localhost:3000/api/health`

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
App available at `http://localhost:3001`

### Database Access
Open [http://localhost:8080](http://localhost:8080) (Adminer)
- **Server:** `orion_mysql`
- **Username:** `orion_user`
- **Password:** `orion_pass_2024`
- **Database:** `orion_db`

## Project Structure
```
project_orion/
├── frontend/          # Next.js 14 (App Router)
├── backend/           # NestJS (Modular Monolith)
├── docker-compose.yml # Dev infrastructure
└── README.md
```

## License
Private — All rights reserved.
