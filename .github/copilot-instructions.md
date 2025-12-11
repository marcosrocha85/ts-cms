# TweetScheduler CMS - AI Agent Instructions

## Project Overview

Single-user CMS for scheduling and auto-posting tweets to X (Twitter) via API v2. Built for @marcosrochagpm to achieve full autonomy over content scheduling and organic monetization within 30 days.

**Architecture:** NestJS + TypeORM + MySQL + @nestjs/schedule (Cron jobs) + Next.js frontend

## Critical Project Rules

### **NEVER use Prettier**

- This project uses **ESLint ONLY** - Prettier is explicitly banned per `docs/project-spec.md`
- `.eslintrc.js` has Prettier removed - do not re-add it
- Any formatting should follow ESLint rules only

### Frontend Import Aliases (Clean Architecture)

- **ALWAYS use path aliases** for imports in the frontend
- **Primary aliases (Clean Architecture layers):**
  - `@presentation/` for components in `src/presentation/` (pages, components, hooks, contexts)
  - `@domain/` for domain layer in `src/domain/` (entities, repositories, use cases)
  - `@data/` for data layer in `src/data/` (implementations, data sources)
- **Generic alias:** `@/` can be used for root-level files (layout, types, styles)
- **Examples:**
  - `import { LoginPage } from '@presentation/pages/LoginPage';`
  - `import { LoginUseCase } from '@domain/usecases/auth/LoginUseCase';`
  - `import { AuthRepository } from '@data/repositories/AuthRepository';`
  - `import { AppMenuItem } from '@/types';`
- **NEVER use relative paths** like `../../src/presentation/` or `../components/` - always use aliases
- These aliases are configured in `frontend/tsconfig.json` paths

### Always Update `docs/todo.md`

- **Before starting any task:** Check `docs/todo.md` for current progress
- **After completing work:** Update completed checkboxes `[x]` and add details
- **When adding features:** Add new tasks to appropriate sections
- This is the project's source of truth for progress tracking

### Single-User System

- Only one user exists: `admin@ts-cms.local` / `admin123` (created via `npm run seed`)
- No user registration endpoints needed
- All routes (except `/auth/login` and `/auth/refresh`) require JWT authentication

## Development Workflow

### Essential Commands

```bash
# Start infrastructure (MySQL only)
docker-compose up -d

# Development server (port 3000)
npm run start:dev

# Create/reset admin user
npm run seed

# Database auto-sync in development
# TypeORM synchronize: true when NODE_ENV=development
# Tables created automatically from entities
```

### Authentication Testing

```bash
# Login (returns accessToken + refreshToken)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ts-cms.local","password":"admin123"}'

# Use accessToken in Authorization header for protected routes
curl http://localhost:3000/protected-route \
  -H "Authorization: Bearer <accessToken>"
```

### Database Configuration

- **Dev:** MySQL on `localhost:3318` (note custom port to avoid conflicts)
- **Database name in .env:** `tweet_scheduler` but Docker creates `ts_cms` - be aware of this mismatch
- **Auto-sync:** Entities in `src/**/*.entity.ts` auto-create tables in dev
- **Migrations:** Use manual migrations in production (not yet implemented)

## Module Structure Pattern

### Feature Module Organization

Each feature follows this structure (see `src/auth/` as example):

```
src/auth/
├── dto/              # Data Transfer Objects with class-validator
│   ├── login.dto.ts
│   └── auth-response.dto.ts
├── entities/         # TypeORM entities
│   └── user.entity.ts
├── strategies/       # Passport strategies (Local, JWT)
│   ├── local.strategy.ts
│   └── jwt.strategy.ts
├── guards/           # Route guards
│   ├── local-auth.guard.ts
│   └── jwt-auth.guard.ts
├── auth.controller.ts
├── auth.service.ts
└── auth.module.ts
```

### Validation Pattern

- Use `class-validator` decorators in DTOs
- Global ValidationPipe configured in `main.ts` with `whitelist: true`
- Example from `login.dto.ts`:

```typescript
@IsEmail()
@IsNotEmpty()
email: string;

@MinLength(6)
password: string;
```

## Key Technical Decisions

### JWT Token Strategy

- **Access token:** Standard `@nestjs/jwt` with 7-day expiry
- **Refresh token:** Uses raw `jsonwebtoken` package due to NestJS v11 type issues
- Both tokens use separate secrets (JWT_SECRET vs JWT_REFRESH_SECRET)
- See `auth.service.ts` login() method for implementation pattern

### TypeORM Configuration

```typescript
// app.module.ts - entities auto-discovered via glob
entities: [__dirname + '/**/*.entity{.ts,.js}'],
synchronize: process.env.NODE_ENV === 'development',
logging: process.env.NODE_ENV === 'development',
```

### Environment Variables

- Managed via `@nestjs/config` as **global module**
- `.env.example` is template - copy to `.env` for local dev
- Access via `ConfigService` injection, never `process.env` directly in services

## Implemented Architecture

### Cron-based Scheduling System

- **Scheduler:** `TweetSchedulerService` with `@Cron(CronExpression.EVERY_MINUTE)`
- **Flow:** Executes every minute, finds tweets with `status='scheduled'` and `scheduledFor <= now`
- **Processing:** Posts tweet via Twitter API, updates status to `posted` or `failed`
- **Error handling:** Catches errors, logs them, and marks tweet as `failed` with error message

### Scheduled Tweets Flow

```
User creates tweet → ScheduledTweet entity saved with status='scheduled'
                   → Cron job runs every minute
                   → Finds tweets ready to post (scheduledFor <= now)
                   → Posts via X API at scheduled time
                   → Update status: posted/failed + tweetId/errorMessage
```

### Media Upload Pattern (Task 5)

- Multer for file handling (max 5MB, up to 4 images)
- Sharp for resize/optimization before X API upload
- Store in `uploads/` directory (not yet created)

## Current State (as of Dec 3, 2025)

✅ **Completed:**

- Infrastructure (Docker, MySQL)
- Auth system (JWT, Passport, bcrypt)
- ValidationPipe global config
- Admin user seed script
- ScheduledTweet CRUD module with full test coverage
- Cron-based scheduler for automatic tweet posting
- Twitter API integration (OAuth 2.0, posting, scheduling)
- Media upload and processing (Multer + Sharp)
- Comprehensive Jest unit tests (89 tests passing)

🚧 **Next Tasks:**

1. Frontend integration with Next.js + PrimeReact
2. Production Docker optimization
3. CI/CD pipeline setup

## Reference Files

- **Project spec:** `docs/project-spec.md` - full requirements and architecture
- **Task tracking:** `docs/todo.md` - detailed progress checklist (update this!)
- **Auth example:** `src/auth/` - reference for module structure pattern
- **Entity example:** `src/auth/entities/user.entity.ts` - TypeORM entity pattern
- **DTO example:** `src/auth/dto/login.dto.ts` - validation pattern

## Common Patterns to Follow

### Module Creation

1. Generate via `nest g module <name>`
2. Create subdirectories: `dto/`, `entities/`
3. Define entity with TypeORM decorators
4. Create DTOs with class-validator
5. Implement service with repository injection
6. Create controller with proper guards
7. Export service if needed by other modules

### Error Handling

- Use NestJS built-in exceptions: `UnauthorizedException`, `NotFoundException`, etc.
- Let global exception filter handle formatting
- Log errors appropriately based on NODE_ENV

### Testing Strategy

- Unit tests not yet implemented (TODO)
- Manual testing via curl commands
- Integration testing planned for CI/CD (Task 6)
