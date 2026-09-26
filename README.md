# MangaForum.us

A manga community being built around chapters, personal reading progress and spoiler-aware discussion. The current Phase 1 slice is a public manga catalog: browse and filter titles, view series metadata, inspect chapter histories and find official editions. No scans are hosted.

## Architecture

Browser → Next.js → Spring Boot → PostgreSQL

Next.js 16, TypeScript, Tailwind CSS and TanStack Query render the catalog. Server Components load overview pages; TanStack Query handles interactive discovery. Next.js forwards browser `/api` requests to Spring Boot, which owns persistence, validation and business logic. Java 21, Spring Security, JPA and Flyway form a modular monolith. PostgreSQL constraints enforce unique chapter numbers, follows and reading progress records.

The foundational User, Manga, Chapter, MangaFollow and UserMangaProgress entities exist. Account creation and mutations are deliberately not exposed yet. Public access is limited to catalog GET endpoints and API documentation; CSRF protection remains enabled.

## Local setup

Install Docker with Compose, then run:

```sh
docker compose up --build
```

Open http://localhost:3000. API: http://localhost:8080/api/manga. Swagger: http://localhost:8080/swagger-ui/index.html.

Compose uses the `demo` profile with six sample titles and synthetic chapter dates, explicitly identified on the homepage. These are development fixtures, not a live release feed. Without that profile, Flyway creates an empty catalog. Never enable demo data on a production database. Typographic title files are placeholders, not official cover art.

PostgreSQL data persists in the `postgres-data` volume. `docker compose down` stops services without removing data. Redis is available with `docker compose --profile async up -d redis`, but no application feature depends on it until the rate-limiting phase.

For development with hot reload, start only PostgreSQL with `docker compose up -d postgres`, then in separate terminals:

```sh
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

```sh
cd frontend
npm ci
CATALOG_DEMO=true npm run dev
```

Requires Java 21+, Maven 3.9+, Node 22 and PostgreSQL. The demo migration is applied by Flyway at startup. Do not edit migrations already applied to a shared database; add a new version.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| DATABASE_URL | jdbc:postgresql://localhost:5432/mangaforum | Backend JDBC connection |
| DATABASE_USER | mangaforum | Database user |
| DATABASE_PASSWORD | local-development-only | Local database password; replace for deployment |
| BACKEND_URL | http://localhost:8080 | Next.js server and API proxy destination |
| SPRING_PROFILES_ACTIVE | unset | Set `demo` only for sample data |
| CATALOG_DEMO | unset | Set `true` to label development fixtures |
| COOKIE_SECURE | false | Set `true` behind HTTPS before accounts launch |

Next.js rewrites are configured at build time. Rebuild the frontend when changing its backend destination. Compose builds with `http://backend:8080` and uses the same address at runtime. Ports are bound to loopback for local use.

## Testing

```sh
cd backend
mvn verify
```

JUnit integration tests use Testcontainers and PostgreSQL 17, requiring a running Docker daemon. They exercise migrations, catalog filters, chapter ordering and invalid requests. They fail rather than silently skip when Docker is unavailable.

```sh
cd frontend
npm ci
npm run build
npm run typecheck
```

GitHub Actions runs the backend integration tests and frontend build. Browser end-to-end flows and screenshots are still pending local runtime verification.

## Next milestones

1. Verify Phase 1 locally with Docker and in a browser.
2. Session-based authentication, profiles, follows and persisted reading progress.
3. Chapter discussions, replies and restrained reactions.
4. Backend spoiler filtering: future-chapter content must be omitted from responses until a reader is eligible or explicitly reveals it. Blurring alone is insufficient. Apply the same rules to previews, search and real-time events.
5. Redis rate limiting, caching, then Spring WebSocket updates.
6. Redis Streams chapter publication jobs and follower notifications.
7. PostgreSQL full-text search, reports and moderation.

No microservices, external search engine, recommendation ML, or object storage are needed for the current slice. Terms and privacy pages describe the actual catalog-stage service and must be updated before accepting accounts.
