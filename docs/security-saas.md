# Security and SaaS Readiness

This template includes foundational SaaS security primitives. They are intentionally small and explicit so product-specific authorization rules can be added on top.

## Data Model

Core SaaS models live in `prisma/schema.prisma`:

- `Organization`: tenant boundary.
- `OrganizationMembership`: user-to-organization membership with `OWNER`, `ADMIN`, or `MEMBER` role.
- `ApiKey`: hashed server-to-server credentials scoped to an organization.
- `AuditLog`: immutable operational trail for sensitive actions.

## Internal API Key

Internal endpoints require the `x-internal-api-key` header and `INTERNAL_API_KEY` must be configured.

Generate a strong value:

```bash
openssl rand -base64 32
```

Never expose internal endpoints publicly without network-level protection.

## Bootstrap An Organization

```bash
curl -X POST http://localhost:3000/internal/organizations \
  -H "content-type: application/json" \
  -H "x-internal-api-key: $INTERNAL_API_KEY" \
  -d '{"name":"Acme Inc","slug":"acme"}'
```

## Create An API Key

```bash
curl -X POST http://localhost:3000/internal/api-keys \
  -H "content-type: application/json" \
  -H "x-internal-api-key: $INTERNAL_API_KEY" \
  -d '{"organizationId":"org_id","name":"Production API","scopes":["jobs:write"]}'
```

The raw API key is returned once. Store it securely. Only its hash is persisted.

## Revoke An API Key

```bash
curl -X DELETE http://localhost:3000/internal/api-keys/<api-key-id> \
  -H "x-internal-api-key: $INTERNAL_API_KEY"
```

## View Audit Logs

```bash
curl http://localhost:3000/internal/audit-logs?organizationId=<org-id> \
  -H "x-internal-api-key: $INTERNAL_API_KEY"
```

## RBAC

Use `hasOrganizationRole()` from `src/lib/security/rbac.ts` to enforce minimum organization roles in product routes.

Typical policy:

- `OWNER`: billing, destructive organization settings, membership ownership transfer.
- `ADMIN`: team management and privileged organization settings.
- `MEMBER`: regular product access.

## Dev Routes

`/dev/*` routes are disabled in production with `ENABLE_DEV_ROUTES=false`.

When enabled, `REQUIRE_DEV_ROUTE_AUTH=true` requires the same `x-internal-api-key` header.
