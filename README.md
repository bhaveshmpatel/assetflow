Here is a highly professional, production-ready `README.md` designed specifically to impress hackathon judges. It acts as both a technical guide and a pitch deck, clearly communicating the architecture, the complex business logic you tackled, and how to instantly test the application.

Copy and paste this directly into your `README.md` file in the root of your repository.

---

```markdown
# 📦 AssetFlow
**Enterprise Asset & Resource Management System**

AssetFlow is a modern, centralized ERP platform designed to simplify and digitize how organizations track, allocate, and maintain their physical assets and shared resources. Built to eliminate manual spreadsheets, AssetFlow provides real-time visibility into asset lifecycles, enforces conflict-free resource booking, and automates maintenance and audit workflows.

---

## ✨ Key Features

* **🛡️ Strict Role-Based Access Control (RBAC):** Multi-tier architecture supporting Admins, Asset Managers, Department Heads, and standard Employees.
* **🔄 Complete Asset Lifecycle Management:** Track assets through defined states (Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed).
* **🚫 Conflict-Free Resource Booking:** An algorithmic booking engine that strictly prevents double-allocation and overlapping time-slot reservations.
* **🛠️ Kanban Maintenance Workflow:** Interactive drag-and-drop board for routing repair requests through an approval pipeline.
* **📋 Automated Enterprise Audits:** Run scheduled audit cycles, verify items, and automatically trigger discrepancy reports and state mutations.
* **📊 Real-Time Analytics:** Data-dense management dashboard featuring utilization trends, maintenance frequencies, and actionable KPI alerts.

---

## 💻 Tech Stack

AssetFlow is built with a focus on type safety, scalable architecture, and premium user experience:

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** [Shadcn UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Charts:** [Recharts](https://recharts.org/)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites
* Node.js (v18 or higher)
* PostgreSQL instance (local or cloud-hosted via Supabase/Neon)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/assetflow.git](https://github.com/yourusername/assetflow.git)
   cd assetflow

```

2. **Install dependencies:**
```bash
npm install

```


3. **Configure Environment Variables:**
Create a `.env` file in the root directory and add your database connection string:
```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/assetflow?schema=public"

```


4. **Initialize the Database:**
Push the Prisma schema to your PostgreSQL database and generate the client:
```bash
npx prisma db push
npx prisma generate

```


5. **Run the Development Server:**
```bash
npm run dev

```


Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to view the application.

---

## 🧪 Hackathon Evaluation Guide (Judge Sandbox)

To make evaluating the platform's strict Role-Based Access Control (RBAC) as seamless as possible, we have implemented a **Developer Sandbox Bypass** on the Sign-In page.

Instead of manually registering and escalating permissions through the database, evaluators can use the Quick-Switch tabs on the login screen to instantly authenticate as:

1. **Admin:** Full access to Organization Setup, Audit closing, and cross-department analytics.
2. **Asset Manager:** Access to approve allocations, manage the Maintenance Kanban board, and register new hardware.
3. **Employee:** Standard restricted view—can only request allocations, book resources, and view assigned items.

### Core Workflows to Test:

* **The Double-Allocation Block:** Attempt to allocate an asset that is already in use to trigger the automated Transfer Request fallback workflow.
* **Time-Slot Validation:** Navigate to Resource Booking and attempt to book a room or vehicle during an already confirmed time block. The transaction will be blocked.
* **Audit State Mutations:** Run a mock audit, mark an item as "Missing", close the cycle, and watch the underlying asset's core status permanently mutate to "Lost".

---

## 🗄️ Database Schema Overview

The application relies on a highly relational PostgreSQL structure to maintain absolute data integrity:

* `User`, `Department`, and `AssetCategory` handle core master data.
* `Asset` represents the physical items and acts as the central node.
* `Allocation`, `TransferRequest`, and `Booking` handle the complex transactional logic and temporal state.
* `MaintenanceRequest` and `AuditCycle` govern the state-machine workflows.
* `ActivityLog` operates as an immutable append-only ledger for all system events.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

```

```