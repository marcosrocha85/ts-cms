# TweetScheduler CMS – Especificações Completas do Projeto

Projeto pessoal de um CMS simples e poderoso para criar, agendar e gerenciar posts no X (Twitter) usando a API oficial v2. O foco é total controle de fila de posts programados (com edição, ativação/desativação e postagem automática na data/hora marcada) usando apenas tecnologias que eu domino e que geram engajamento real no meu perfil de programação.

## Objetivo Principal
Ter 100% de autonomia para planejar semanas inteiras de conteúdo (Node.js, NestJS, TypeScript, JavaScript, PHP, UEFN/Verse, etc.) sem depender de ferramentas terceiras pagas, ao mesmo tempo em que gero valor real para a comunidade e acelero a monetização orgânica do meu perfil @marcosrochagpm em até 30 dias.

## Tecnologias Escolhidas (Stack definitiva)

### Frontend
- **Next.js** (v13.4.8) – Framework React com App Router (file-based routing)
- **React** (v18.2.0) – UI library
- **PrimeReact** (v10.2.1) – UI component library (Sakai template)
- **PrimeFlex** (v3.3.1) – CSS utility framework
- **PrimeIcons** (v6.0.1) – Icon library
- **Chart.js** (v4.2.1) – Data visualization
- **TypeScript** (v5.1.3) – Type safety
- **Axios** – HTTP client
- **date-fns** – Date utilities
- **SASS** (v1.63.4) – CSS preprocessor

**Versões críticas (Sakai compatibility):**
```json
{
  "dependencies": {
    "next": "13.4.8",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "primereact": "10.2.1",
    "primeflex": "^3.3.1",
    "primeicons": "^6.0.1",
    "chart.js": "4.2.1",
    "axios": "^1.13.2",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@types/node": "20.3.1",
    "@types/react": "18.2.12",
    "@types/react-dom": "18.2.5",
    "typescript": "5.1.3",
    "sass": "^1.63.4",
    "prettier": "^2.8.8"
  }
}
```

**Clean Architecture no Frontend:**
```
frontend/
├── app/                          # Next.js App Router (APENAS roteamento)
│   ├── (main)/
│   │   ├── page.tsx             # Re-exporta DashboardPage
│   │   └── layout.tsx           # Layout principal (sidebar + topbar)
│   ├── (full-page)/
│   │   └── auth/login/page.tsx  # Re-exporta LoginPage
│   └── layout.tsx               # Root layout
├── src/                         # Clean Architecture
│   ├── domain/                  # Camada de domínio (entities, repositories, use cases)
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   └── ScheduledTweet.ts
│   │   ├── repositories/
│   │   │   ├── AuthRepository.ts
│   │   │   └── ScheduledTweetRepository.ts
│   │   └── usecases/
│   │       ├── auth/
│   │       │   ├── LoginUseCase.ts
│   │       │   └── RefreshTokenUseCase.ts
│   │       └── scheduled-tweets/
│   ├── data/                    # Camada de dados (implementations)
│   │   ├── datasources/
│   │   │   └── ApiDataSource.ts # Axios client com interceptors
│   │   └── repositories/
│   │       ├── AuthRepository.ts
│   │       └── ScheduledTweetRepository.ts
│   └── presentation/            # Camada de apresentação (UI lógica)
│       ├── pages/               # Componentes de página (lógica real)
│       │   ├── LoginPage.tsx
│       │   ├── DashboardPage.tsx
│       │   └── TweetsPage.tsx
│       ├── components/          # Componentes reutilizáveis
│       ├── hooks/               # Custom hooks
│       └── contexts/            # React contexts
├── layout/                      # Sakai layout components (sidebar, topbar)
├── demo/                        # Sakai demo components
├── styles/                      # Sakai SCSS styles
└── public/                      # Static assets

**Padrão de roteamento Next.js + Clean Architecture:**
- `app/(main)/page.tsx` → Re-exporta `src/presentation/pages/DashboardPage.tsx`
- `app/(full-page)/auth/login/page.tsx` → Re-exporta `src/presentation/pages/LoginPage.tsx`
- Arquivos em `app/` são minimalistas (só roteamento)
- Lógica real fica em `src/presentation/pages/`
```

### Backend
- **NestJS** (v10+) – estrutura enterprise, modular, TypeScript nativo
- **TypeORM** + **MySQL** (ou MariaDB) – banco relacional simples e confiável
- **@nestjs/schedule** – Cron jobs para processamento de tweets agendados (executa a cada minuto)
- **Passport + JWT** – autenticação local (e-mail/senha) + proteção de rotas
- **class-validator** + **class-transformer** – validação forte
- **Twitter API v2** (agora X API) com pacote oficial `twitter-api-v2`
- **Multer** + **sharp** – upload e redimensionamento de imagens (máx 5 MB, como exige a API do X)
- **Docker** + **Docker Compose** – ambiente de dev e produção idêntico

### Outras ferramentas
- GitHub + GitHub Actions (CI/CD)
- ESLint (jamais usar Prettier no backend)
- Prettier (apenas no frontend para consistência com Sakai)

## Funcionalidades Obrigatórias (MVP – 1ª versão)

1. **Autenticação**
   - Login/senha (único usuário – eu mesmo)
   - JWT com refresh token
   - Middleware de proteção em todas as rotas exceto login

2. **CRUD de Tweets Agendados**
   - Criar tweet:
     - Texto (máx 280 caracteres)
     - Upload de até 4 imagens (ou 1 GIF/vídeo – respeitando limites da API)
     - Data e hora de postagem (DateTime picker)
     - Status: `draft | scheduled | posted | failed | disabled`
   - Listagem com filtros (hoje, semana, todos, falhados, etc.)
   - Editar texto/imagens/data qualquer tweet antes de ser postado
   - Ativar/desativar (toggle rápido)
   - Excluir permanentemente

3. **Agendamento Inteligente (Cron Jobs)**
   - Cron job executa a cada minuto verificando tweets prontos para postar
   - Tweets com `status='scheduled'` e `scheduledFor <= now` são processados automaticamente
   - Tratamento de erro com status `failed` e log de erro detalhado
   - Sistema roda continuamente via @nestjs/schedule

4. **Preview real do tweet**
   - Renderizar exatamente como o X mostra (com preview de link se houver URL)
   - Usar a mesma lógica de card que o X usa (og:tags simulados ou chamada à API de preview se necessário)

5. **Histórico de tweets já postados**
   - Guardar o `tweet_id` retornado pela API
   - Link direto para o tweet publicado
   - Estatísticas básicas (impressões, likes, etc. – via API se possível)

6. **Dashboard simples**
   - Próximos 5 tweets agendados
   - Tweets postados hoje
   - Contador de tweets na fila
   - Últimos erros (se houver)

## Modelo de Banco de Dados (TypeORM entities)

```ts
// user.entity.ts (único usuário)
export class User {
  id: number;
  email: string;
  password: string; // hashed
  createdAt: Date;
}

// scheduled-tweet.entity.ts
export class ScheduledTweet {
  id: number;
  text: string;
  mediaPaths: string[]; // JSON array com caminhos no disco ou URLs
  scheduledFor: Date;
  status: 'draft' | 'scheduled' | 'posted' | 'failed' | 'disabled';
  tweetId?: string; // preenchido após postagem
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Tabelas adicionais se necessário (ex: refresh_tokens).

## Estrutura de Pastas Proposta

```
src/
├── auth/
├── scheduled-tweets/
│   ├── dto/
│   ├── entities/
│   ├── scheduled-tweets.controller.ts
│   ├── scheduled-tweets.service.ts
│   └── scheduled-tweets.module.ts
├── scheduler/
│   ├── tweet-scheduler.service.ts  # Cron job processor
│   └── scheduler.module.ts
├── twitter/
├── media/                     # uploads + processed
├── common/
├── config/
└── app.module.ts
public/
```

## Variáveis de Ambiente (.env)

```env
# App
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=tweet_scheduler

# Twitter API v2 (X API)
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=
# ou OAuth 2.0 User Context se preferir (recomendado para postar como eu)

# JWT
JWT_SECRET=supersegredo
JWT_EXPIRES_IN=7d
```

## Como a postagem automática funciona (fluxo)

1. Usuário salva tweet com data futura → status = scheduled
2. Cron job (`TweetSchedulerService`) executa a cada minuto:
   - Busca tweets com `status='scheduled'` e `scheduledFor <= now`
   - Para cada tweet encontrado:
     - Faz upload das mídias (se houver) usando `v2.uploadMedia`
     - Chama `client.v2.tweet()` com texto + media_ids
     - Atualiza registro com tweetId e status = posted
     - Em caso de erro → status = failed + errorMessage

## Roadmap rápido

- Dia 1–3 → NestJS + TypeORM + Auth + CRUD básico
- Dia 4–6 → Cron jobs + Worker de postagem
- Dia 7–9 → Upload de mídia + preview correto
- Dia 10 → Dockerização completa
- Dia 11+ → Polishing, dark mode, testes manuais e deploy

## Licença
MIT (ou como eu preferir)

---

Projeto feito por Marcos Rocha (@marcosrochagpm) – 100% focado em crescimento orgânico e ensino real de programação enquanto construo minha própria ferramenta de monetização.