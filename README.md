# NETRONiX Network Society Web Portal & Complaint Management System

The official web portal and operations infrastructure for the **NETRONiX Network Society** at the Ghulam Ishaq Khan Institute of Engineering Sciences and Technology (GIKI). Built with Next.js 16 (App Router), React 19, TypeScript, PostgreSQL (Supabase), Prisma ORM, Tailwind CSS v4, Framer Motion, and Web Audio.

---

## 📑 Complete 20-Step Setup & Operations Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Node.js**: `v20.x` or higher
* **npm**: `v10.x` or higher
* **PostgreSQL Client Tools** (optional, for local automated backups): `pg_dump` and `psql`

---

### 2. Install Dependencies
Clone the repository and install all dependencies:
```bash
npm install
```

---

### 3. Create a Supabase Account
1. Visit [supabase.com](https://supabase.com) and sign up or log in.
2. The system works seamlessly on the **Supabase Free Tier**.

---

### 4. Create a Supabase Project
1. Click **New Project** in your Supabase dashboard.
2. Select your organization and enter:
   * **Name**: `netronix-portal`
   * **Database Password**: Generate and securely store a strong password.
   * **Region**: Choose the region closest to your deployment (e.g., `Central EU (Frankfurt)` or `Southeast Asia (Singapore)`).
3. Click **Create new project** and wait ~2 minutes for provisioning.

---

### 5. Obtain PostgreSQL Connection Strings
In your Supabase project dashboard:
1. Navigate to **Project Settings** (gear icon) $\rightarrow$ **Database**.
2. Scroll to **Connection string**:
   * **Transaction Pooler (Port 6543)**: Select `URI` mode with `pgbouncer=true`. Copy this string for `DATABASE_URL`.
   * **Session / Direct Connection (Port 5432)**: Select `Session` or `Direct`. Copy this string for `DIRECT_URL`.
3. Replace `[YOUR-PASSWORD]` in both strings with your actual database password.

---

### 6. Configure Local Environment (`.env.local`)
Copy the provided `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the values:
```env
# ─── PostgreSQL Database (Supabase) ──────────────────────────────────────────
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# ─── Administrative Authentication ───────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ADMIN_JWT_SECRET="your-32-character-or-longer-secure-random-secret-key"

# ─── Transactional Email (Resend) ────────────────────────────────────────────
RESEND_API_KEY="re_123456789_abcdefghijklmnopqrstuvwxyz"
RESEND_FROM_EMAIL="NETRONiX Support <onboarding@resend.dev>"

# ─── Application URL ──────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

### 7. Generate Prisma Client
Generate the type-safe Prisma client:
```bash
npm run db:generate
```

---

### 8. Push Database Schema & Migrations
Synchronize your Prisma schema with your PostgreSQL database:
```bash
npm run db:push
```
*(Or use `npm run db:migrate` to create standard versioned SQL migrations).*

---

### 9. Create the Initial Administrator Account
Run the secure admin CLI utility:
```bash
npm run seed:admin
```
Follow the interactive prompt to specify the Administrator Email and Password (min 8 characters). Passwords are securely hashed with bcrypt (salt rounds = 12).

---

### 10. Configure Resend for Transactional Email
1. Sign up for a free account at [resend.com](https://resend.com).
2. Go to **API Keys** and click **Create API Key**.
3. Copy the key starting with `re_...` and set it as `RESEND_API_KEY` in `.env.local`.

---

### 11. Configure Email Sender / Domain
* **Development / Testing**: Use the default sandbox sender: `onboarding@resend.dev`. In sandbox mode, Resend permits sending emails to the account registration email address.
* **Production**: In Resend $\rightarrow$ **Domains**, add your custom domain (e.g. `netronix.giki.edu.pk`), verify the DNS TXT/MX records, and set `RESEND_FROM_EMAIL="NETRONiX Operations <noreply@netronix.giki.edu.pk>"`.

---

### 12. Run the Application Locally
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 13. Test Complaint Submission (Student Flow)
1. Scroll to the **Report Network Issue** section on the homepage (`#portal`).
2. Fill out:
   * **Full Name**: e.g., `Ali Khan`
   * **Student Email**: e.g., `ali.khan@example.com`
   * **Room / Block**: e.g., `Hostel 8, Room 302`
   * **Issue Category**: e.g., `Campus WiFi`
   * **Description**: Detailed description ($\ge 10$ characters).
3. Click **Submit Report**.
4. A unique, cryptographically random Ticket ID (`NX-XXXXXXXX`) is displayed, and a confirmation email is dispatched via Resend.
5. In the **Track Ticket** tab, enter the Ticket ID and registered email to view live real-time status.

---

### 14. Test Admin Operations Dashboard
1. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. Sign in with the credentials created in Step 9.
3. In the Dashboard (`/admin`), you can:
   * View live statistics cards (Total, Reported, Assigned, In Progress, Resolved, Rejected).
   * Search complaints by Ticket ID, student name, email, or room.
   * Filter by status, issue category, or assigned engineer.
   * Click **Inspect** on any complaint to open the triage modal.
   * Update status, assign a staff member, add public resolution notes, and view the immutable status history audit trail.
   * Saving status updates automatically sends status notification emails to the student.

---

### 15. Deploy to Vercel
1. Push your repository to GitHub / GitLab.
2. Log in to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your `NETRONiX-Web-Portal` repository.
4. Select Framework Preset: **Next.js**.

---

### 16. Configure Vercel Environment Variables
In the Vercel project deployment settings, add the following environment variables:
* `DATABASE_URL` = Connection pooler URI (Port 6543)
* `DIRECT_URL` = Direct PostgreSQL URI (Port 5432)
* `ADMIN_JWT_SECRET` = Your 32+ character secret
* `RESEND_API_KEY` = Your Resend API key
* `RESEND_FROM_EMAIL` = Verified sender email
* `NEXT_PUBLIC_APP_URL` = Your production Vercel domain (e.g. `https://netronix.giki.edu.pk`)

---

### 17. Run Production Database Migrations
Before deploying or after updating schemas, apply database migrations to your production database from your terminal:
```bash
npx prisma db push
```

---

### 18. Configure Automated Local Backups (Windows)
Because the Supabase free tier does not include point-in-time recovery, an automated PowerShell backup script is included at [`scripts/backup-db.ps1`](file:///C:/Users/aitez/Desktop/netronix/NETRONiX-Web-Portal/scripts/backup-db.ps1).

1. Test the backup script manually:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\backup-db.ps1
   ```
   Dumps are saved to `backups/netronix_db_backup_YYYY-MM-DD_HH-mm-ss.sql`.
   The script automatically enforces an **8-week (56-day) retention policy** and purges older dumps.

2. **Automate with Windows Task Scheduler**:
   * Open **Task Scheduler** on Windows $\rightarrow$ **Create Basic Task**.
   * Name: `NETRONiX Database Daily Backup`
   * Trigger: `Daily` at `02:00 AM`.
   * Action: `Start a program`
     * **Program/script**: `powershell.exe`
     * **Add arguments**: `-ExecutionPolicy Bypass -File "C:\Users\aitez\Desktop\netronix\NETRONiX-Web-Portal\scripts\backup-db.ps1"`
     * **Start in**: `C:\Users\aitez\Desktop\netronix\NETRONiX-Web-Portal`

---

### 19. Restore a Database Backup
To restore the PostgreSQL database from any timestamped SQL dump:
```bash
psql "postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres" < backups/netronix_db_backup_2026-08-16_14-30-00.sql
```

---

### 20. Security & Architecture Design Summary

| Feature | Implementation |
| :--- | :--- |
| **Ticket ID Security** | Generated using cryptographically random byte buffers with an unambiguous 31-character alphabet (`NX-7K4M9X2Q`, 852+ billion combinations). |
| **Student Privacy** | Zero student registration required. Ticket lookup strictly enforces matching both `ticketId` AND `email`. Generic 404 responses prevent ID enumeration attacks. |
| **Admin Authentication** | Secure `httpOnly`, `secure`, `sameSite: "lax"` cookie sessions signed via JWT (`jose` / HS256) with 7-day expiration. |
| **Password Storage** | Passwords hashed using `bcryptjs` with salt rounds = 12. |
| **Role-Based Access Control (RBAC)** | Strict role separation (`ADMIN` vs `MANAGER`). Sensitive administrative mutations (e.g. staff provisioning) require `ADMIN` role. |
| **Rate Limiting** | In-memory sliding window rate limiting on complaint creation (6/10 min per IP), ticket tracking (20/5 min per IP), and admin login (5/15 min per IP). |
| **Audit Trail** | Dedicated `complaint_status_history` table tracking status transitions, timestamps, actor IDs, and administrative notes. |
| **Transactional Integrity** | Prisma `$transaction` guarantees complaint creation and status history succeed atomically. Email failures are logged without aborting transactions. |

---

## 🛠 Available Scripts

* `npm run dev`: Start Next.js development server.
* `npm run build`: Compile and generate optimized production bundle.
* `npm run lint`: Run ESLint checks.
* `npm run db:generate`: Generate Prisma client code.
* `npm run db:push`: Push Prisma schema directly to PostgreSQL.
* `npm run db:migrate`: Create and execute Prisma SQL migrations.
* `npm run db:studio`: Launch graphical Prisma Studio in browser.
* `npm run seed:admin`: Securely provision administrative users.
* `npx tsx scripts/test-system.ts`: Run the automated system test suite.
* `.\scripts\backup-db.ps1`: Execute automated database backup and retention purge.
