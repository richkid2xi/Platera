# Platera Deployment Guide

This document outlines the deployment configuration for Platera's split-hosting architecture:
- **Backend:** Railway (Node.js/Express)
- **Frontend:** Vercel (React/Vite)

## Railway (Backend) Configuration

The backend is configured to automatically build and deploy via `railway.toml`.

### Build & Start Commands
- **Build**: `npm run build` (This runs `tsc` and `prisma generate`)
- **Start**: `npx prisma migrate deploy && npm start` (This ensures migrations run before the server starts)

### Environment Variables
You must configure the following variables in your Railway project settings:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Transactional connection string for Prisma. |
| `DIRECT_URL` | Direct connection string for Supabase migrations. |
| `JWT_SECRET` | Secret key for JWT signing. |
| `CLIENT_URL` | The production URL of your Vercel frontend (e.g., `https://platera.vercel.app`). Used for CORS. |
| `SENTRY_DSN` | Your Sentry project DSN for error tracking. |
| `PAYSTACK_SECRET_KEY` | Your Paystack live secret key for payment processing. |
| `SUPABASE_URL` | Your Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY`| The `service_role` secret for bypassing RLS during storage uploads. |
| `NODE_ENV` | Must be set to `production`. |

## Vercel (Frontend) Configuration

The frontend communicates with the backend via the `VITE_API_URL` environment variable.

### Environment Variables
- `VITE_API_URL`: Set this to your Railway production URL (e.g., `https://platera-backend.up.railway.app`).

### Cross-Origin Security Notes
1. **Cookies**: The `platera_auth_session` cookie is configured as `httpOnly`, `secure`, and `sameSite: 'lax'`.
2. **CORS**: The backend's CORS configuration dynamically reads the `CLIENT_URL` environment variable and enables `credentials: true`. The frontend's Axios instance must include `withCredentials: true`.
3. **HTTPS**: Both domains (Vercel and Railway) MUST be served over HTTPS in production, otherwise browsers will reject the secure cookie.

## Final Pre-Launch Checklist

- [ ] **Run Migrations**: Ensure `npx prisma migrate deploy` runs successfully against your production `DATABASE_URL` before traffic arrives.
- [ ] **Test Sentry**: Deliberately trigger an error on the staging backend and verify it appears in your Sentry dashboard.
- [ ] **Configure Paystack Webhooks**: Log in to your Paystack dashboard and set the Webhook URL to `https://<YOUR_RAILWAY_URL>/api/webhooks/paystack`.
- [ ] **Verify WebSockets**: Confirm that Socket.io connects successfully across domains. The CORS logic in `src/websocket/socket.ts` relies on `CLIENT_URL`.
