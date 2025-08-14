# NextLevelCoach.ai Microservices Plan

Audience: Engineering, DevOps, and Product. This is the canonical, living plan for decomposing the current Nx monorepo backend into microservices while introducing course hosting.

Last updated: 2025-08-11

Summary:
- Keep Nx monorepo for code layout; deploy independently as services.
- Single Postgres cluster with separate schemas and least-privileged DB users per service.
- CloudAMQP (RabbitMQ) as event broker; API Gateway fronts services at api.nextlevelcoach.ai.
- Subdomains: nextlevelcoach.ai (marketing/landing), coach.nextlevelcoach.ai (coach app), admin.nextlevelcoach.ai (admin app), api.nextlevelcoach.ai (gateway).
- Start with Billing (Payments) extraction; Courses and Media are greenfield services.

---

1. Target Service Map (initial wave)

- API Gateway (Edge / BFF)
  - Responsibilities: Authentication/authorization, request routing, rate limiting, schema validation, response shaping for web apps.
  - Interface: HTTP/REST (OpenAPI), JWT validation. No DB access.
  - Dependencies: Auth Service, Billing, Leads, Content (for now), Courses, Media, Email, Integrations.

- Auth Service
  - Owns: Admin, Coach identities, passwords, OAuth (Google), sessions/JWT, password reset.
  - DB: schema auth (tables: admins, coaches, audit/activity_logs).
  - Events: auth.user.created, auth.password.reset_requested.

- Billing Service (aka Payments/Subscriptions)
  - Owns: plans, subscriptions, invoices, transactions, payment_links, stripe customer/payment methods.
  - Integrations: Stripe (webhooks), Email (invoices/receipts), Notifications.
  - DB: schema billing (plans, subscriptions, invoices, transactions, payment_links, payment_methods).
  - Events: billing.subscription.activated, billing.payment.completed, billing.invoice.issued, billing.payment.failed, billing.payment_link.created.

- Courses Service (new)
  - Owns: courses, modules/lessons, enrollments, progress tracking.
  - DB: schema courses (courses, lessons, enrollments, progress snapshots, analytics aggregates).
  - Events: courses.course.created, courses.enrollment.created, courses.progress.updated, courses.enrollment.completed.

- Media Service (new)
  - Abstraction over Vimeo (later S3/CloudFront optional). Handles uploads, transcoding status, playback metadata, secure links.
  - DB: schema media (assets, uploads, provider_mappings, usage stats).
  - Events: media.asset.created, media.asset.ready, media.asset.failed, media.asset.deleted.

- Email/Comms Service
  - Owns: email templates, sequences, scheduled emails, deliverability metrics.
  - Integrations: Mailgun.
  - DB: schema comms (email_templates, sequences, scheduled_emails, provider_messages).
  - Events: comms.sequence.started, comms.email.sent, comms.email.failed, comms.email.opened, comms.email.clicked.

- Leads/CRM Service
  - Owns: leads, lead stats, landing intake, basic client records if minimal CRM is needed.
  - DB: schema leads (leads, stats). Optionally small clients table or this stays with CRM.
  - Events: leads.lead.created, leads.status.changed, leads.converted.

- Integrations/Webhooks Service
  - Owns: third-party webhooks (Stripe relay to Billing, Calendly, future integrations), retries, dead letter handling.
  - DB: schema integrations (webhook_events, integration configs).
  - Events: integrations.webhook.received, integrations.webhook.failed, integrations.webhook.processed.

- Analytics/Reporting Service
  - Owns: daily KPIs, platform analytics, aggregates from events.
  - DB: schema analytics (daily_kpis, platform_analytics, aggregates per domain).
  - Events: analytics.snapshot.updated.

- Notifications Service
  - Owns: in-app notifications for admins/coaches.
  - DB: schema notifications (notifications, read states).
  - Events: notify.user (fan-out based on routing key).

Note: Some of these can remain as modules inside the API until extracted. The extraction order below minimizes risk.

---

2. Data Ownership and Boundaries

- Auth owns identities (admins, coaches). Other services reference coachID/adminID as foreign keys but cannot modify identity records.
- Billing owns all money artifacts (plans, subscriptions, transactions, invoices, payment_links, payment_methods). Others read via API or subscribe to events.
- Courses owns course lifecycle and enrollments. Billing triggers enrollment via event upon purchase; Courses validates idempotency.
- Media owns asset lifecycle and returns playback info to Courses and Content.
- Comms (Email) owns email sending/scheduling, reacts to domain events but never writes domain DBs.
- Analytics is read-only aggregator from events, never a source of truth for domain data.

---

3. Messaging and Eventing (RabbitMQ on CloudAMQP)

- Exchange topology
  - nlc.domain.events (topic): publishes domain events with routing keys like billing.payment.completed, courses.enrollment.created.
  - nlc.integrations.webhooks (fanout): raw webhook intake for downstream processors.
  - Dead-letter exchanges per service: nlc.dlx.<service>.

- Contracts
  - Use JSON schemas versioned per event type, stored in repo under docs/contracts/events/<domain>/<event>.schema.json.
  - Required metadata fields: eventId (uuid), occurredAt (ISO-8601), producer, schemaVersion, traceId, source.
  - Payload includes minimal identifiers and denormalized fields needed by consumers.

- Delivery guarantees
  - At-least-once with idempotent consumers. Each service maintains an event_outbox table to ensure publish-on-commit (Outbox pattern) where applicable.

---

4. APIs and AuthN/Z

- External clients hit api.nextlevelcoach.ai (gateway). Gateway validates JWT, forwards to service APIs or composes responses.
- Internal service-to-service auth via mTLS or signed service tokens with short TTL and audience claims.
- OpenAPI per service; publish swagger at /docs behind auth for internal and staging; public docs selectively exposed.

---

5. Storage Strategy

- Single Postgres cluster; schemas: auth, billing, courses, media, comms, leads, integrations, analytics, notifications.
- Each service gets:
  - dedicated DB user with privileges only to its schema;
  - Prisma client scoped to its schema (if continuing Prisma);
  - migrations owned by the service.

---

6. Observability and Ops

- Logging: structured JSON logs with traceId. Correlate HTTP requests to message consumes via W3C trace context.
- Metrics: Prometheus-compatible endpoints (/metrics) per service; key SLOs: request latency, error rates, queue lag.
- Tracing: OpenTelemetry SDK, exporter to OTLP (e.g., Honeycomb/Tempo/Jaeger).
- Health: /health and /ready endpoints per service, include dependencies (DB, broker, third-parties).

---

7. Security

- Secrets: managed via Render environment variables initially; rotate Stripe/Mailgun keys; never commit secrets.
- JWT: HS256 for now with strong secret; consider RS256 with JWKS when introducing multi-issuers.
- Webhooks: Verify signatures (Stripe, Mailgun). Ingest through Integrations service then fan-out to owners.
- PII: minimize; encrypt sensitive columns at rest where applicable.

---

8. Phased Migration Plan (target: start this week)

Phase 0 – Prep (same-day)
- Define schemas per service in the same database. Create least-privileged DB users. Configure CloudAMQP instance and exchanges/queues. Create this plan doc. 

Phase 1 – Extract Billing first (low coupling, high value)
- Carve out Billing module into a standalone service deployment while keeping code in monorepo.
- Expose /payments, /subscriptions, /invoices under api gateway path /billing/*.
- Stripe webhooks move to Integrations service, which then publishes to nlc.domain.events for Billing consumption, or Billing keeps webhook temporarily and later hands off.
- Emit events: billing.payment.completed, billing.subscription.activated.

Phase 2 – Introduce Courses (greenfield)
- Implement Courses service with enrollments and progress. Subscribe to billing events to auto-create enrollments.
- Define REST endpoints for course management (admin/coach) and learner progress reads for dashboards.

Phase 3 – Media abstraction (Vimeo)
- Implement Media service to wrap Vimeo: upload, status polling/webhooks, playback URLs. Courses references Media assets by ID.

Phase 4 – Email and Leads stabilization
- Move Email/Comms into its own service (Mailgun). Leads remains a service to own landing intake and CRM-lite.

Phase 5 – Observability hardening and infra cleanup
- Centralize logs, metrics, traces; set up dashboards and alerts. Tighten security (service tokens, rate limits, WAF at gateway).

---

9. Example Event Contracts (draft)

- billing.payment.completed v1
{
  "eventId": "uuid",
  "occurredAt": "2025-08-11T20:14:00Z",
  "producer": "billing-service",
  "schemaVersion": 1,
  "traceId": "...",
  "payload": {
    "transactionId": "uuid",
    "coachId": "uuid",
    "planId": "uuid",
    "amount": 5000,
    "currency": "USD",
    "externalPaymentId": "pi_...",
    "status": "completed"
  }
}

- courses.enrollment.created v1
{
  "eventId": "uuid",
  "occurredAt": "...",
  "producer": "courses-service",
  "schemaVersion": 1,
  "traceId": "...",
  "payload": {
    "enrollmentId": "uuid",
    "courseId": "uuid",
    "clientId": "uuid",
    "coachId": "uuid"
  }
}

---

10. Routing and Domains

- api.nextlevelcoach.ai
  - /auth/* -> Auth Service
  - /billing/* -> Billing Service
  - /courses/* -> Courses Service
  - /media/* -> Media Service
  - /leads/* -> Leads Service
  - /comms/* -> Email/Comms Service
  - /integrations/* -> Integrations Service
  - /analytics/* -> Analytics Service
  - /notifications/* -> Notifications Service

- coach.nextlevelcoach.ai — consumes gateway; admin.nextlevelcoach.ai — admin portal.

---

11. Local Development

- Keep Nx for dev ergonomics. Each service runs on its own port, gateway proxies locally.
- Use docker-compose for Postgres and pgAdmin (already present). Add local RabbitMQ if desired or use CloudAMQP dev instance.
- Seed data per service; use Prisma migrate per schema.

---

12. Deployment Checklist (Render + CloudAMQP)

- Create Render services for: gateway, auth, billing, courses, media, leads, comms, integrations, analytics, notifications. Use monorepo builds with filtered paths.
- Configure environment variables per service (DB URL, SCHEMA name, service-specific secrets, RabbitMQ URL, STRIPE keys where applicable).
- Set health checks (/health). Autoscaling and CPU/memory alerts.
- CloudAMQP: create exchanges, queues, DLQs; apply HA if needed.
- Stripe/Mailgun webhooks: point to Integrations (or Billing temporarily), rotate secrets.
- Observability: attach OTLP exporter, log drains, dashboards.

---

13. Risks and Mitigations

- Scope creep: keep initial cuts thin; prefer event-driven sync over cross-service queries.
- Consistency: use outbox pattern and idempotency keys.
- Incident response: DLQ monitoring, replay tools, feature flags for cutovers.

---

Appendix: Migration Notes for Current Repo
- Payments code under apps/api can be deployed as Billing service first with minimal path changes; Prisma models already align with clean ownership (Plan, Subscription, Transaction, Invoice, PaymentLink, PaymentMethod).
- Courses: schema exists; implement controllers/services in new service, not in the existing API app.
- Media: wrap Vimeo via provider field in Content or Courses to decouple.
