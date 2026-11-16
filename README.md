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

## Getting Started

Follow these steps to run LendLoop in a local development environment.

### Prerequisites

Make sure you have the following installed or configured:

- Node.js
- npm
- A Clerk application
- A Convex project
- Git

Docker Desktop is additionally required if you want to run the local n8n environment.

### 1. Clone the Repository

```bash
git clone https://github.com/Pranav9948/lendloop.git
cd lendloop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create your local environment file:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux:**

```bash
cp .env.example .env.local
```

Configure the required Clerk, Convex and n8n environment variables.

### 4. Start Convex

Start the Convex development process:

```bash
npx convex dev
```

Make sure your local environment is connected to the correct Convex project.

### 5. Start the Next.js Application

Open a separate terminal in the project root:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

### 6. Run Project Checks

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Running n8n Locally

LendLoop uses n8n for request notifications and scheduled overdue-loan reminder workflows.

A Docker Compose configuration is provided in the `n8n` directory.

### 1. Configure Environment Variables

From the project root, create the local n8n environment file:

```powershell
Copy-Item .\n8n\.env.example .\n8n\.env
```

Configure the required values in `n8n/.env`.

The configuration includes:

- n8n encryption key.
- Webhook-signing secret.
- Local n8n host and webhook settings.
- Timezone configuration.

Do not commit `n8n/.env` to Git.

### 2. Start n8n

From the project root:

```powershell
cd n8n
docker compose up -d
```

### 3. Open the n8n Editor

Visit:

```text
http://localhost:5678
```

### 4. Import the Workflows

Import the workflow exports from:

```text
n8n/workflows/
├── request-notifications.json
└── daily-overdue-reminders.json
```

Configure the required credentials, webhook endpoints and environment settings.

### 5. Test Before Activation

Before activating either workflow:

- Verify webhook authentication and signature validation.
- Confirm the Convex endpoints are reachable.
- Test request notification processing.
- Test overdue-loan retrieval and reminder processing.
- Verify duplicate-event handling and failure behavior.

Activate workflows only after the relevant tests pass.

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
