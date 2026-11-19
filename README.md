# LendLoop

A community tool-lending platform built with **Next.js, React, Clerk, Convex and n8n**.

LendLoop enables users to share tools within a community by listing tools they own, discovering available listings, requesting to borrow tools and managing lending activities.

The platform includes user and admin dashboards, borrowing request management, loan tracking and automated notification workflows.

**Live Application:** https://lendloop-alpha.vercel.app/

**GitHub Repository:** https://github.com/Pranav9948/lendloop

**SupaDEMO Admin portal:** https://app.supademo.com/demo/cmwjtdyws0893qm9qhlo5vc6p?utm_source=link
**SupaDEMO User portal:** https://app.supademo.com/demo/cmwjtlgnq08o9qm9qkvd5lmbz

# What I Would Improve Before Taking LendLoop to Production

LendLoop covers the core borrowing workflow, but there are a few areas I would focus on before making it available to a larger number of users.

First, I would spend more time strengthening security, especially backend permission checks, tool ownership validation and input validation. I would also add rate limiting to protect important endpoints.

I would improve the borrowing process to handle situations where multiple users try to request or borrow the same tool at the same time. Preventing overlapping bookings and keeping loan records consistent would be important.

For the n8n workflows, I would add better retry and failure-handling mechanisms so that failed notifications or overdue reminders can be recovered without processing the same event twice.

I would also introduce proper logging, error monitoring and alerts to make it easier to identify and investigate problems.

As usage grows, I would look at optimizing Convex queries, adding pagination where needed and monitoring application performance.

Finally, I would add more automated tests for critical workflows and establish a reliable backup and recovery process.

**My main priority would be to make sure the application is secure and reliable first, before focusing on scaling it further.**

## Features

### User Features

- **Browse Tools:** Discover available tools and filter listings by category.
- **Tool Listings:** Create and manage personal tool listings with descriptions and condition details.
- **Borrowing Requests:** Request tools for specific date ranges.
- **Request Management:** View submitted requests and manage incoming requests for owned tools.
- **Loan Tracking:** Track active loans and mark borrowed tools as returned.
- **Notifications:** Receive updates about borrowing requests and loan-related events.

### Admin Features

- **Admin Dashboard:** Access a dedicated platform administration area.
- **Tool Management:** View and manage tool listings.
- **Loan Management:** View and manage platform loan records.
- **User Management:** View platform users and manage trusted-lender status.

### Automation Features

- **Request Notifications:** Process request-related events through n8n workflows.
- **Overdue Reminders:** Run scheduled workflows for overdue-loan reminders.
- **Event Tracking:** Maintain automation execution status and attempt counts.
- **Duplicate Processing Protection:** Use event records to support idempotent automation processing.

## Technology Stack

| Layer              | Technology      | Purpose                                     |
| ------------------ | --------------- | ------------------------------------------- |
| Frontend Framework | Next.js 16      | Application framework and routing           |
| UI Library         | React 19        | Component-based user interface              |
| Language           | TypeScript      | Type safety and maintainability             |
| Styling            | Tailwind CSS 4  | Responsive UI styling                       |
| Authentication     | Clerk           | User authentication and identity management |
| Backend            | Convex          | Server-side functions and application logic |
| Database           | Convex Database | Persistent application data                 |
| Automation         | n8n             | Event-driven and scheduled workflows        |
| Date Utilities     | date-fns        | Date manipulation and formatting            |
| Icons              | Lucide React    | Interface icons                             |

### Development Tools

- **npm** — Package management.
- **ESLint** — Code quality and linting.
- **Prettier** — Code formatting.
- **Docker Compose** — Local n8n environment.
- **Vercel** — Frontend deployment.

## Application Routes

### Public Routes

| Route      | Description         |
| ---------- | ------------------- |
| `/`        | Public landing page |
| `/sign-in` | User sign-in        |
| `/sign-up` | User registration   |

### User Dashboard

| Route                          | Description                              |
| ------------------------------ | ---------------------------------------- |
| `/dashboard`                   | Main user dashboard                      |
| `/dashboard/tools`             | Browse available tools                   |
| `/dashboard/my-listings`       | Manage personal tool listings            |
| `/dashboard/my-requests`       | View submitted borrowing requests        |
| `/dashboard/incoming-requests` | Manage requests received for owned tools |
| `/dashboard/my-loans`          | View loan activity                       |

### Admin Dashboard

| Route                    | Description             |
| ------------------------ | ----------------------- |
| `/dashboard/admin`       | Administrative overview |
| `/dashboard/admin/tools` | Manage tool listings    |
| `/dashboard/admin/loans` | View and manage loans   |
| `/dashboard/admin/users` | Manage platform users   |

## System Architecture

LendLoop follows a frontend-backend architecture using Next.js, Clerk, Convex and n8n.

### High-Level Architecture

```text
                    Users
                      |
                      v
              Next.js Application
                (React + TypeScript)
                      |
             +--------+--------+
             |                 |
             v                 v
           Clerk             Convex
       Authentication     Backend + Database
                               |
                  +------------+------------+
                  |            |            |
                  v            v            v
                Users        Tools       Borrowing
                                           Requests
                                              |
                                              v
                                            Loans
                                              |
                                              v
                                       Automation Events
                                              |
                                              v
                                             n8n
                                      /             \
                                     v               v
                              Notifications    Overdue Reminders
```

### Main Components

**1. Next.js Application**

Provides the user interface, application routing, public pages, user dashboards and admin dashboards.

**2. Clerk Authentication**

Handles user sign-in, sign-up and identity management. Clerk identity is associated with the application's user records.

**3. Convex Backend**

Handles application operations, including user management, tool listings, borrowing requests, loan management, notifications and administrative operations.

**4. Convex Database**

Stores application data using structured tables, indexes and relationships.

**5. n8n Automation**

Handles external automation workflows for request-related notifications and scheduled overdue-loan reminders.

### Backend Module Organization

The Convex backend is separated into modules according to responsibility:

| Module                   | Responsibility                  |
| ------------------------ | ------------------------------- |
| `users.ts`               | User-related operations         |
| `tools.ts`               | Tool listing operations         |
| `borrowRequests.ts`      | Borrowing request operations    |
| `loans.ts`               | Loan lifecycle operations       |
| `admin.ts`               | Administrative operations       |
| `dashboard.ts`           | Dashboard data                  |
| `notifications.ts`       | Notification operations         |
| `automation.ts`          | Automation-related operations   |
| `automationMutations.ts` | Automation state mutations      |
| `http.ts`                | HTTP endpoints and integrations |
| `crons.ts`               | Scheduled backend jobs          |

## Database Design

LendLoop uses the Convex database to store users, tool listings, borrowing requests, loans and automation records.

The database schema contains eight application tables.

### Database Tables

| Table              | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `users`            | Stores user identity, Clerk ID, role and trusted status                     |
| `tools`            | Stores tool details, category, condition, owner and listing status          |
| `borrowRequests`   | Stores borrowing requests, date ranges, borrower, lender and request status |
| `loans`            | Stores approved loan information, due dates and return status               |
| `notifications`    | Stores user notifications and related event references                      |
| `trustedLenders`   | Tracks trusted-lender records, granting administrator and status            |
| `automationEvents` | Tracks automation events, processing status and attempt counts              |
| `processedEvents`  | Records processed event IDs and their processing status                     |

### Main Data Relationships

- A user can own multiple tools.
- A tool can receive multiple borrowing requests.
- Each borrowing request identifies a borrower, lender and tool.
- An approved borrowing request is associated with a loan.
- A loan records the borrower, lender, tool and due date.
- Notifications can reference related borrowing requests or loans.
- Automation events can reference the related request or loan.
- Processed event records help track previously handled automation events.

### Indexing and Search

The schema defines indexes to support common data access patterns, including:

- Looking up users by Clerk ID.
- Finding tools by owner, category and listing status.
- Retrieving requests by borrower, lender and status.
- Finding loans by borrower, lender, tool and due date.
- Retrieving notifications by user and read status.
- Tracking automation events by status and related records.

Search indexes are also defined for tools, users and loans.

## Authentication and Authorization

LendLoop uses **Clerk** for authentication and **Convex** for backend operations and application-level user data.

### Role-Based Access Control (RBAC)

LendLoop defines two application roles:

| Role    | Description            |
| ------- | ---------------------- |
| `user`  | Regular platform user  |
| `admin` | Platform administrator |

The user's role is stored in the `users` table in Convex.

### Authorization Principles

Sensitive operations should enforce authorization in Convex backend functions.

Examples include:

- Administrative operations should verify that the authenticated user has the `admin` role.

Frontend route protection and conditional rendering improve the user experience, but backend authorization remains essential because frontend controls can be bypassed.

## n8n Automation

LendLoop integrates with **n8n** to handle event-driven notifications and scheduled overdue-loan reminders.

### Workflow 1: Request Notifications

**Workflow file:** `n8n/workflows/request-notifications.json`

This workflow is designed to receive request-related events from the Convex backend through an HTTP webhook and process notification actions.

Expected event types include:

- `request_created`
- `request_approved`
- `request_declined`

### Workflow 2: Daily Overdue Reminders

**Workflow file:** `n8n/workflows/daily-overdue-reminders.json`

This workflow is designed to run on a schedule and process reminders for overdue loans.

The intended workflow includes:

1. Triggering the workflow on a schedule.
2. Retrieving overdue loan information from the application backend.
3. Processing reminder notifications.
4. Recording the automation result in the application backend.

### Automation Reliability

The application schema includes automation-related records to support reliable processing:

- Event processing status.
- Attempt counts.
- Last-attempt timestamps.
- Completion timestamps.
- Failure status and error information.
- Processed event records for duplicate-processing protection.

### Workflow Configuration

Workflow exports are stored in the repository under:

```text
n8n/
├── docker-compose.yml
├── .env.example
└── workflows/
    ├── request-notifications.json
    └── daily-overdue-reminders.json
```

The workflows require appropriate webhook endpoints, credentials and environment configuration before activation.

## Environment Variables

LendLoop uses environment variables to configure authentication, backend connectivity and automation integrations.

Create a `.env.local` file in the project root using `.env.example` as a reference.

### Application Environment Variables

| Variable                            | Purpose                          |
| ----------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key            |
| `CLERK_SECRET_KEY`                  | Clerk server-side secret         |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`     | Sign-in page URL                 |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`     | Sign-up page URL                 |
| `NEXT_PUBLIC_CONVEX_URL`            | Convex deployment URL            |
| `NEXT_PUBLIC_CONVEX_SITE_URL`       | Convex HTTP actions URL          |
| `CLERK_FRONTEND_API_URL`            | Clerk frontend API configuration |
| `N8N_WEBHOOK_URL`                   | n8n webhook endpoint             |
| `N8N_WEBHOOK_SECRET`                | Shared webhook-signing secret    |

### Getting Started

## HOW TO RUN PROJECT ON YOUR LOCAL SYSTEM AND TEST

This guide explains how to clone, configure, and run the LendLoop application locally, including its Convex backend and n8n automation workflows.

## Prerequisites

Ensure the following tools are installed before proceeding:

- Node.js and npm
- Git
- Docker Desktop
- Cloudflare Tunnel (`cloudflared`)
- A Google account for authentication
- Convex development account

---

## Phase 1 – Clone the Repository

Clone the project repository:

```bash
git clone <YOUR_REPOSITORY_URL>
```

Navigate to the project directory:

```bash
cd lendloop
```

## Phase 2 – Configure Environment Variables

1. Locate the `.env.example` file in the project root.
2. Review the required environment variables.
3. Create a local `.env.local` file.

```bash
copy .env.example .env.local
```

4. Configure all required environment variables using your own development credentials.

Make sure to provide the necessary Clerk and Convex configuration values.

**Important:** Never commit `.env.local` or any file containing secrets to GitHub.

## Phase 3 – Install and Run the Application

Install the project dependencies:

```bash
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

Open the application:

**http://localhost:3000**

### Start the Convex Backend

Open a separate terminal in the project root and run:

```bash
npx convex dev
```

This starts the Convex development process, watches backend changes, and keeps your local application connected to the Convex development deployment.

Keep both development terminals running:

- Terminal 1: Next.js development server
- Terminal 2: Convex development server

### Verify the Application

1. Open `http://localhost:3000`.
2. Sign up or log in using your Google account.
3. Verify that authentication works correctly.
4. You can access the application as a normal user.

### Configure an Admin Account

To test the admin functionality:

1. Open your Convex dashboard.
2. Navigate to the **Data** section.
3. Open the `users` table.
4. Find your user record using your authenticated user ID.
5. Update the `role` field from `user` to `admin`.
6. Save the changes.
7. Refresh the application and verify that admin access is available.

**Security note:** This is a development-only procedure. Production admin roles should be assigned through a secure, authorized administrative process.

### Run Code Quality Checks

Execute the following commands to verify the application:

```bash
npm run lint
npm run build
```

Both commands should complete successfully before proceeding.

### Test Tool Listing Functionality

To verify that the core application functionality works:

1. Log in to the application.
2. Navigate to **My Listings**.
3. Create a new tool listing.
4. Enter the required tool information.
5. Save the listing.
6. Verify that the newly created tool appears correctly.

My Listings:

http://localhost:3000/dashboard/my-listings

---

## Phase 4 – Configure n8n Environment Variables

Navigate to the `n8n` directory.

Locate the `n8n/.env.example` file and create a new `.env` file:

```bash
copy n8n/.env.example n8n/.env
```

Generate secure random values for the n8n encryption key and LendLoop HMAC secret.

Run the following command in PowerShell or a terminal:

```bash
node -e "const c = require('crypto'); console.log('N8N_ENCRYPTION_KEY=' + c.randomBytes(32).toString('hex') + '\nLENDLOOP_HMAC_SECRET=' + c.randomBytes(32).toString('hex'));"
```

Copy the generated values into `n8n/.env`.

Ensure that:

- `N8N_ENCRYPTION_KEY` is configured in the n8n environment.
- `LENDLOOP_HMAC_SECRET` matches the `N8N_WEBHOOK_SECRET` configured in Convex.

**Important:** Generate these values only once for your environment. Keep them consistent across restarts. Do not regenerate them after configuring credentials or integrations.

---

## Phase 5 – Start the Local n8n Instance

Make sure Docker Desktop is running.

Start the n8n container using Docker Compose:

```bash
docker compose --env-file n8n/.env -f n8n/docker-compose.yml up -d
```

To check whether the container is running:

```bash
docker ps
```

To inspect the container logs:

```bash
docker logs lendloop-n8n
```

Open the n8n editor:

**http://localhost:5678**

### Expose n8n Using Cloudflare Tunnel

Convex functions execute in the cloud, so they cannot directly access an n8n instance running on your local machine through `localhost`.

To make your local n8n webhook accessible to Convex, start a Cloudflare Tunnel:

```bash
cloudflared tunnel --url http://localhost:5678
```

Cloudflare will generate a temporary public HTTPS URL.

Example:

```text
https://your-generated-name.trycloudflare.com
```

Keep the tunnel terminal running while testing the application.

**Note:** Quick Tunnel URLs are temporary and may change when the tunnel restarts. Update the relevant configuration whenever the URL changes.

### Configure the Convex Webhook URL

Use the Cloudflare HTTPS URL and append the n8n production webhook path:

```text
https://your-generated-name.trycloudflare.com/webhook/lendloop-events
```

Configure the Convex environment variables:

```bash
npx convex env set N8N_WEBHOOK_URL "https://your-generated-name.trycloudflare.com/webhook/lendloop-events"
```

Configure the HMAC secret using the same value as `LENDLOOP_HMAC_SECRET` in `n8n/.env`:

```bash
npx convex env set N8N_WEBHOOK_SECRET "YOUR_LENDLOOP_HMAC_SECRET"
```

Verify the configured webhook URL:

```bash
npx convex env get N8N_WEBHOOK_URL
```

Verify that the URL includes the correct production webhook path.

---

## Phase 6 – Configure Docker Compose for n8n

Open:

```text
n8n/docker-compose.yml
```

Under the n8n service's `environment` section, configure the following values:

```yaml
environment:
  - WEBHOOK_URL=https://your-generated-name.trycloudflare.com/
  - N8N_EDITOR_BASE_URL=https://your-generated-name.trycloudflare.com/
  - N8N_PROXY_HOPS=1
```

Use your actual Cloudflare URL instead of the example URL.

These settings help n8n generate the correct externally accessible webhook URLs when running behind a reverse proxy or tunnel.

Keep the existing database, encryption key, and other environment configurations intact.

### Restart the n8n Container

After updating the configuration, restart the container:

Stop the existing container:

```bash
docker compose --env-file n8n/.env -f n8n/docker-compose.yml down
```

Start it again:

```bash
docker compose --env-file n8n/.env -f n8n/docker-compose.yml up -d
```

### Verify the Container Configuration

Check the configured webhook URL:

```bash
docker exec lendloop-n8n printenv WEBHOOK_URL
```

Check the editor base URL:

```bash
docker exec lendloop-n8n printenv N8N_EDITOR_BASE_URL
```

Check the proxy configuration:

```bash
docker exec lendloop-n8n printenv N8N_PROXY_HOPS
```

Confirm that the values match your current Cloudflare tunnel configuration.

---

## Phase 7 – Import the LendLoop n8n Workflow

Open the local n8n editor:

**http://localhost:5678**

Follow these steps:

1. Open the Workflows section.
2. Create a new workflow.
3. Click the three-dot menu (`...`) in the workflow editor.
4. Select **Import from File**.
5. Navigate to the project's `n8n/workflows` directory.
6. Select the provided LendLoop workflow JSON file.
7. Wait for the workflow to load.
8. Review the imported nodes and their connections.
9. Configure any missing credentials.
10. Verify that the Webhook node uses the `POST` method and the expected path: `lendloop-events`.
11. Verify that the HMAC verification configuration uses the same secret configured in Convex.
12. Save the workflow.
13. Activate the workflow.

**Important:** Convex uses the production webhook endpoint. Ensure that the workflow is active before testing application events.

---

## Phase 8 – Test the Complete Application and Automation

Now that the application, Convex backend, and n8n automation are configured, perform an end-to-end test.

### Test Borrowing and Notifications

1. Open the LendLoop application:

   http://localhost:3000

2. Log in using a normal user account.
3. Navigate to the tools listing page.
4. Select an available tool.
5. Create a borrow request.
6. Verify that the borrowing request is successfully created.
7. Check the n8n workflow execution history.
8. Verify that the webhook execution completed successfully.
9. Confirm that the expected notification was delivered.

### Final Verification Checklist

- [ ] Next.js application starts successfully.
- [ ] Convex development server is running.
- [ ] User authentication works.
- [ ] Admin and normal user access work correctly.
- [ ] Tool listings can be created.
- [ ] Borrow requests can be submitted.
- [ ] n8n Docker container is running.
- [ ] Cloudflare Tunnel is accessible.
- [ ] Convex webhook URL is correctly configured.
- [ ] HMAC authentication succeeds.
- [ ] n8n workflow is active.
- [ ] Borrow request notifications are delivered successfully.

---

## Setup Complete!

If all the above steps work successfully, your local LendLoop development environment is ready.

You can now explore the application, create tool listings, submit borrowing requests, manage approvals, and test the automated notification workflows.

**Happy testing!**

## Security Considerations

Security is an important consideration in LendLoop because the application manages user identities, tool ownership, borrowing requests and loan records.

### Authentication

- Clerk is used for user authentication.
- Application user records are associated with Clerk identities.
- Authenticated operations should verify the current user's identity.

### Authorization and RBAC

- The application defines `user` and `admin` roles.
- Sensitive operations should enforce role checks inside Convex backend functions.
- Resource ownership should be verified before allowing users to modify listings or borrowing records.
- Administrative operations should be restricted to authorized administrators.

### Data Privacy

- Public tool discovery should expose only the information required to browse listings.
- Private user information should not be unnecessarily exposed through public queries.
- Backend queries should return only the data required by the requesting user.

### Webhook Security

The Convex-to-n8n integration is designed to use a shared webhook-signing secret.

The webhook security design includes:

- HMAC-based request signatures.
- Timestamp validation to help reject stale requests.
- Signature comparison using a timing-safe operation.
- Secret values stored in environment configuration rather than workflow source code.

### Automation Reliability

- Automation events maintain processing states.
- Attempt counts and failure information support troubleshooting.
- Processed event records provide a foundation for idempotent processing.

### Secret Management

- Private credentials must remain outside source control.
- Environment variables are used for sensitive configuration.
- Production credentials should be stored using the deployment platform's secret-management facilities.

## Production Improvements

The following improvements would further strengthen LendLoop for production use.

1.  **Future Enhancement Feature** Real-Time Borrower–Lender Messaging

2.  **Testing and Observability:** Add unit, integration and end-to-end tests, along with structured logging and error monitoring.

3.  **Deployment and Operations:** Establish automated CI/CD, database backup and recovery procedures, and secure production secret management.
