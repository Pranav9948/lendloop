# LendLoop — Security Documentation

## 1. Authentication

- Clerk handles user sign-in and sign-up.
- Authenticated identities are associated with user records in Convex.
- Application operations should verify the authenticated user's identity.

## 2. Role-Based Access Control

LendLoop supports two roles:

- `user` — Regular application user.
- `admin` — Platform administrator.

Sensitive operations should enforce role and resource-ownership checks in Convex backend functions.

## 3. Data Protection

- Keep private credentials in environment variables.
- Never commit `.env.local` or `n8n/.env`.
- Avoid exposing private user information through public queries.
- Return only the data required by each application feature.

## 4. Webhook Security

The Convex-to-n8n integration is designed to use:

- HMAC-based request signatures.
- Timestamp validation.
- Timing-safe signature comparison.
- Environment-based secret storage.

## 5. Security Testing

Before production deployment, verify:

- User and admin permissions.
- Tool ownership restrictions.
- Borrowing and loan access controls.
- Webhook signature validation.
- Duplicate-event handling.
