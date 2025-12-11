# TweetScheduler CMS

Single-user CMS for scheduling and auto-posting tweets to X (Twitter) via API v2. Built to achieve full autonomy over content scheduling and organic growth for [@marcosrochagpm](https://x.com/marcosrochagpm).

## 🎯 Project Goal

100% control over planned content weeks in advance (Node.js, NestJS, TypeScript, JavaScript, PHP, UEFN/Verse, etc.) without depending on paid third-party tools, while generating real value for the community and accelerating organic profile growth.

## 🏗️ Tech Stack

### Backend

- **Framework:** NestJS v10 + TypeORM + MySQL
- **Authentication:** Passport + JWT (local email/password)
- **Media Processing:** Multer + Sharp
- **Scheduler:** @nestjs/schedule (cron jobs)
- **External API:** Twitter API v2 (OAuth 2.0)

### Frontend

- **Framework:** Next.js 13.4 (App Router)
- **UI Library:** PrimeReact 10.2 (Sakai template)
- **Architecture:** Clean Architecture (domain/data/presentation)
- **State:** React Context + Custom Hooks
- **Styling:** PrimeFlex + SASS

### Infrastructure

- **Database:** MySQL 8.0
- **Containerization:** Docker + Docker Compose
- **Monorepo:** npm workspaces

## 📚 Documentation

- **[Accessibility](docs/accessibility.md)** - Accessibility considerations and features
- **[Project Specification](docs/project-spec.md)** - Complete requirements, architecture, and database models
- **[AI Agent Instructions](.github/copilot-instructions.md)** - Guidelines for AI coding assistants

## 🤖 AI-Assisted Development

This application was built almost entirely via Vibe Coding—an AI-led workflow with minimal manual coding. The process was constrained by upfront documentation (project specs, todo tracking, and explicit agent instructions) so the AI stayed aligned with the goals. The approach was inspired by Elemar Jr.'s talk on AI-guided delivery (https://www.youtube.com/watch?v=2rRWoooAsdo).

It took: 15 days

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose

### Installation

```bash
# Install all workspace dependencies (root + backend + frontend)
npm install

# Copy environment variables
cp .env.example .env

# Configure Twitter OAuth credentials in .env:
# TWITTER_CLIENT_ID=your_client_id
# TWITTER_CLIENT_SECRET=your_client_secret
# TWITTER_CALLBACK_URL=http://localhost:3000/api/twitter/callback
# FRONTEND_URL=http://localhost:3001

# Start infrastructure (MySQL)
npm run infra:up

# Create admin user
npm run seed
```

### Running the Application

```bash
# Development mode (both backend + frontend)
npm run dev

# Or run separately:
npm run backend    # NestJS API on port 3000
npm run frontend   # Next.js on port 3001
```

**URLs:**

- Backend API: **http://localhost:3000/api**
- Frontend: **http://localhost:3001**

### Default Credentials

```
Email: admin@ts-cms.local
Password: admin123
```

## 🔑 Authentication

Test login endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ts-cms.local","password":"admin123"}'
```

Returns `accessToken` and `refreshToken` for protected routes.

## 📦 Monorepo Structure

```
ts-cms/
├── apps/
│   ├── backend/                # NestJS API
│   │   ├── src/
│   │   │   ├── auth/          # JWT authentication
│   │   │   ├── scheduled-tweets/
│   │   │   ├── twitter/       # X API integration
│   │   │   ├── media/         # File upload
│   │   │   ├── scheduler/     # Cron jobs
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── frontend/               # Next.js app
│       ├── app/                # App Router (routes)
│       ├── src/
│       │   ├── domain/         # Entities, use cases
│       │   ├── data/           # API clients
│       │   └── presentation/   # Pages, components
│       └── package.json
│
├── infrastructure/
│   └── docker-compose.yml      # MySQL
│
├── docs/                       # Project documentation
└── package.json                # Workspace root
```

## 🛠️ Available Scripts

### Workspace (Root)

```bash
npm run dev          # Start both backend + frontend
npm run build        # Build both apps
npm run lint         # Lint all workspaces
npm run test         # Test all workspaces
npm run seed         # Create admin user
```

### Infrastructure

```bash
npm run infra:up     # Start Docker (MySQL)
npm run infra:down   # Stop Docker
npm run infra:logs   # View logs
```

### Individual Apps

```bash
npm run backend      # Backend only (port 3000)
npm run frontend     # Frontend only (port 3001)
npm run backend:build
npm run frontend:build
```

### Workspace-specific Commands

```bash
# Run in specific workspace
npm run <script> -w @ts-cms/backend
npm run <script> -w @ts-cms/frontend

# Install dependency in workspace
npm install <package> -w @ts-cms/backend
```

## ⚙️ Key Features

- JWT authentication with refresh tokens
- TypeORM with MySQL (auto-sync in development)
- Docker containerization
- Global validation with class-validator
- Scheduled tweets CRUD (full backend API)
- X API v2 OAuth 2.0 integration
- Automatic tweet posting (cron jobs)
- Media upload with optimization (Multer + Sharp)
- Automatic file cleanup (cost optimization)
- **Email notifications** (SMTP support - Gmail, Mailtrap, SendGrid)
  - ✉️ Success notification when tweet is posted
  - ⚠️ Error notification when posting fails
  - 📧 HTML templates with professional styling
  - 🔗 Direct link to posted tweet on X
- Next.js frontend with Clean Architecture
- PrimeReact UI with Sakai template
- Profile and Settings pages
- Tweet creation/editing with media upload
- Password change endpoint
- Dashboard charts and calendar
- Advanced filters (status, date range)
- Testing with Jest

## 📝 Development Notes

- **No Prettier on Backend:** Uses ESLint only (per specification)
- **Prettier on Frontend:** Enabled for consistency with Sakai template
- **Custom MySQL port:** 3318 (to avoid conflicts)
- **Database auto-sync:** Enabled in development only
- **Monorepo:** npm workspaces for dependency isolation
- **Clean Architecture:** Frontend follows domain/data/presentation layers

## 🤝 Contributing

This is a personal project by [@marcosrochagpm](https://x.com/marcosrochagpm). Feel free to fork and adapt for your own use.

## 📄 License

Proprietary

---

Built by [Marcos Rocha](https://github.com/marcosrocha85) - 100% focused on organic growth and real programming education while building my own growth tool.
