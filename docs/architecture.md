# LendLoop — System Architecture

## 1. Architecture Overview

LendLoop is a full-stack community tool-lending application built using Next.js, Clerk, Convex and n8n.

The application follows a frontend-backend architecture where Next.js provides the user interface, Clerk handles authentication, Convex manages application logic and data, and n8n handles external automation workflows.

### Core Components

| Component      | Technology           | Responsibility                                        |
| -------------- | -------------------- | ----------------------------------------------------- |
| Frontend       | Next.js 16, React 19 | User interface and application routing                |
| Authentication | Clerk                | User identity and authentication                      |
| Backend        | Convex               | Application queries, mutations and backend operations |
| Database       | Convex Database      | Persistent application data                           |
| Automation     | n8n                  | Notifications and scheduled workflows                 |
| Hosting        | Vercel               | Application deployment                                |

### Architecture Goals

- Maintain separation between frontend presentation and backend business logic.
- Centralize application data management in Convex.
- Use authenticated identities to associate operations with application users.
- Organize backend functionality into domain-specific modules.
- Integrate external automation through HTTP-based communication.

## 2. Frontend Architecture

LendLoop uses Next.js App Router with React and TypeScript to organize the application into public and authenticated sections.

### Application Structure

```text
src/
└── app/
    ├── (public)/
    │   ├── layout.tsx
    │   └── page.tsx
    │
    ├── (dashboard)/
    │   ├── layout.tsx
    │   └── dashboard/
    │       ├── page.tsx
    │       ├── tools/
    │       ├── my-listings/
    │       ├── my-requests/
    │       ├── incoming-requests/
    │       ├── my-loans/
    │       └── admin/
    │           ├── page.tsx
    │           ├── tools/
    │           ├── loans/
    │           └── users/
    │
    ├── sign-in/
    ├── sign-up/
    └── layout.tsx
```

### Main Frontend Areas

**Public Area**

Provides the public landing page and access to authentication.

**User Dashboard**

Provides interfaces for browsing tools, managing listings, submitting borrowing requests and tracking loans.

**Admin Dashboard**

Provides administrative interfaces for managing platform tools, loans and users.

**Authentication Pages**

Clerk-powered sign-in and sign-up pages handle user authentication.

### Frontend Responsibilities

- Render application pages and reusable UI components.
- Manage user interactions and form inputs.
- Display data retrieved from Convex.
- Provide navigation between application features.
- Present role-specific dashboard interfaces.

The frontend is responsible for presentation and interaction. Sensitive business rules and authorization decisions should remain enforced by the backend.

## 3. Authentication Architecture

LendLoop uses Clerk for authentication and Convex for application-level user data and backend operations.

### Authentication Components

- **Clerk:** Handles user registration, sign-in and authentication sessions.
- **Convex Auth Integration:** Provides authenticated identity information to Convex backend functions.
- **Users Table:** Stores application user records, including the associated Clerk ID and application role.

### Authentication Flow

```text
          User
            |
            v
      Next.js Application
            |
            v
          Clerk
      Sign In / Sign Up
            |
            v
   Authenticated Identity
            |
            v
       Convex Backend
            |
            v
     Identify Application
          User
            |
            v
       Users Table
```

### User Identity Mapping

The `users` table contains a `clerkId` field used to associate a Clerk identity with an application user record.

Application-level user information includes:

- Clerk user ID.
- Name and email (optional).
- Application role (`user` or `admin`).
- Trusted status.
- Creation and update timestamps.

### Authentication and Authorization Separation

Authentication establishes the identity of the current user.

Authorization determines whether that user can perform a particular operation.

Convex backend functions should independently enforce authorization for sensitive operations rather than relying only on frontend visibility or navigation restrictions.

## 4. Backend Architecture

LendLoop uses Convex as its backend platform for application logic, database operations and HTTP integrations.

Backend functionality is organized into domain-specific modules to keep responsibilities separated and make the codebase easier to maintain.

### Backend Modules

| Module                   | Responsibility                  |
| ------------------------ | ------------------------------- |
| `users.ts`               | User-related operations         |
| `tools.ts`               | Tool listing operations         |
| `borrowRequests.ts`      | Borrowing request management    |
| `loans.ts`               | Loan lifecycle management       |
| `admin.ts`               | Administrative operations       |
| `dashboard.ts`           | Dashboard data                  |
| `notifications.ts`       | Notification management         |
| `automation.ts`          | Automation-related operations   |
| `automationMutations.ts` | Automation state updates        |
| `http.ts`                | HTTP endpoints and integrations |
| `crons.ts`               | Scheduled backend jobs          |
| `schema.ts`              | Database schema and indexes     |

### Backend Responsibilities

- Validate application inputs.
- Execute application business logic.
- Read and update persistent data.
- Enforce authentication and authorization.
- Manage borrowing requests and loan records.
- Coordinate automation-related events.

### Backend Communication

The Next.js frontend communicates with Convex through its client integration.

Convex provides reactive queries for retrieving application data and mutations for performing data updates.

HTTP actions provide an integration point for external services such as n8n.

## 5. Database Architecture

LendLoop uses the Convex database to store application data. The schema is defined in `convex/schema.ts` and contains eight application tables.

### Database Collections

| Table              | Responsibility                                      |
| ------------------ | --------------------------------------------------- |
| `users`            | User identity, application roles and trusted status |
| `tools`            | Tool listings, ownership and availability status    |
| `borrowRequests`   | Borrowing requests, date ranges and request status  |
| `loans`            | Approved loans, due dates and return information    |
| `notifications`    | User notifications                                  |
| `trustedLenders`   | Trusted-lender records                              |
| `automationEvents` | Automation execution tracking                       |
| `processedEvents`  | Event-processing records                            |

### Borrowing Lifecycle

```text
User Lists a Tool
        |
        v
    Tool Record
        |
        v
Borrower Creates Request
        |
        v
 Borrow Request
     (Pending)
        |
        v
Lender Reviews Request
        |
   +----+----+
   |         |
Approve    Decline
   |         |
   v         v
 Loan     Request
 Record   Declined
   |
   v
Active Loan
   |
   v
Tool Returned
   |
   v
Loan Marked Returned
```

### Indexing Strategy

The schema defines indexes to support common application queries:

- User lookup by Clerk ID.
- Tool lookup by owner and listing status.
- Borrowing request lookup by borrower and lender.
- Loan lookup by borrower, lender, tool and due date.
- Notification lookup by user and read status.
- Automation event lookup by processing status and related records.

Search indexes are also defined for tools, users and loans.

### Data Integrity Considerations

Convex backend functions should validate relationships between users, tools, borrowing requests and loans before modifying records.

Date-range validation, ownership verification and concurrent request handling are important considerations for maintaining consistent lending records.
