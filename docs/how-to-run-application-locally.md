# LendLoop – Local Development Setup

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
