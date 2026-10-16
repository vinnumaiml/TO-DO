# TO-DO — Fullstack Task Management Application

A modern, fast, and responsive fullstack **TODO** application built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. It provides complete user authentication and task management capabilities, allowing users to register, log in, create $N$ tasks, organize with tags, track task completion progress, write and update task descriptions anytime, edit statuses and priorities, recover mistakenly deleted tasks from a Recycle Bin, and reset passwords if forgotten.

---

## ✨ Features

- **🔐 User Authentication & Account Recovery**:
  - Secure **Sign Up** & **Login** with password hashing using `bcryptjs`.
  - **🔑 Forgot Password Recovery**: Easily reset forgotten passwords with a 6-digit verification code.
  - HTTP-only cookie-based session management using JSON Web Tokens (`jose`).
  - Route protection middleware: unauthenticated users are automatically redirected to `/login`, and authenticated users go directly to their dashboard.
  - Personalized time-of-day greeting (☀️ Good morning, 🌤️ Good afternoon, 🌆 Good evening, 🌙 Good night) and live today's date banner.

- **📋 Task Management (Full CRUD)**:
  - **Create Tasks**: Add tasks with Title, Description/Notes, Status, Priority, and **#Tags**.
  - **Edit Tasks Anytime**: Update task title, description notes, status, priority, and tags at any time via the Edit modal.
  - **Quick Status Toggle**: Mark tasks completed in one click or cycle through *Pending* → *In Progress* → *Completed*.
  - **Unlimited Tasks**: Users can create $N$ tasks; each user's tasks are kept strictly isolated to their account.

- **🏷️ Tags & Categorization**:
  - Add multiple tags to tasks with quick presets (*Work, Personal, Urgent, Study, Dev, Design, Finance*).
  - Click any tag on a task card to instantly filter your workspace by that tag.
  - Filter by tags in the search bar.

- **♻️ Recycle Bin & Mistake Recovery**:
  - Deleted tasks are safely moved to the **Recycle Bin** instead of disappearing immediately.
  - Open the **Recycle Bin** to **Recover** mistakenly deleted tasks back to your active list in one click.
  - Permanently delete single tasks or empty the entire Recycle Bin whenever you want.

- **📈 Visual Task Progress Bars**:
  - **Overall Workspace Progress**: Multi-color milestone progress bar showing exact completion percentage, active vs pending breakdown, and motivational goals.
  - **Task-Level Progress Bar**: Each task card has its own visual progress indicator (Pending 0% ➔ In Progress 50% ➔ Completed 100%).

- **📊 Home Dashboard & Organization**:
  - **Interactive Statistics Cards**: Real-time counters for *Total Tasks*, *Pending*, *In Progress*, and *Completed* tasks. Clicking any card filters tasks by that status.
  - **Live Search**: Search through task titles, descriptions, and `#tags` in real time.
  - **Filter & Sort**: Filter by status, priority, and tags, and sort by *Newest, Oldest, Priority, or Recently Updated*.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React 18 + App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Authentication**: JWT (`jose`) with HTTP-only cookies & `bcryptjs` password encryption
- **Database**: Thread-safe persistent JSON database with atomic writes in `data/todo.json` (runs out of the box on all platforms including Windows ARM64 & x64 with zero native DLL dependencies).

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on Node.js v24)
- **npm** (or yarn / pnpm)

### 2. Start the Development Server
Run the following command in PowerShell / Terminal:

```bash
npm run dev
```

### 3. Open in Browser
Open [http://localhost:3000](http://localhost:3000) in your web browser.

- If you don't have an account yet, click **"Sign up free"** to register with your name, email, and password.
- If you forget your password, click **"Forgot password?"** on the login page to recover it.
- Create tasks, add tags (#Work, #Urgent), track your progress bar, and recover any deleted tasks from the Recycle Bin!

---

## 📂 Project Structure

```
TODO/
├── data/
│   └── todo.json                     # Persistent data storage (users & tasks)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── forgot-password/route.ts  # Recovery code generation
│   │   │   │   ├── login/route.ts            # Login endpoint
│   │   │   │   ├── logout/route.ts           # Logout endpoint
│   │   │   │   ├── me/route.ts               # Current user session endpoint
│   │   │   │   ├── register/route.ts         # Registration endpoint
│   │   │   │   └── reset-password/route.ts   # Password reset endpoint
│   │   │   └── tasks/
│   │   │       ├── route.ts                  # GET (search/filter/tags) & POST tasks
│   │   │       ├── recycle-bin/route.ts      # GET & DELETE (empty) recycle bin
│   │   │       ├── [id]/route.ts             # GET, PUT, soft & hard DELETE
│   │   │       └── [id]/restore/route.ts     # Restore task from Recycle Bin
│   │   ├── forgot-password/
│   │   │   └── page.tsx                      # Password recovery workflow page
│   │   ├── login/
│   │   │   └── page.tsx                      # Sign In page with forgot password link
│   │   ├── register/
│   │   │   └── page.tsx                      # Sign Up page
│   │   ├── globals.css                       # Tailwind directives & theme styles
│   │   ├── layout.tsx                        # Root layout & page metadata
│   │   └── page.tsx                          # Home page with task workspace & stats
│   ├── components/
│   │   ├── DeleteConfirmModal.tsx            # Move to Recycle Bin confirmation
│   │   ├── Navbar.tsx                        # Header with Recycle Bin counter & avatar
│   │   ├── RecycleBinModal.tsx               # Modal to restore or permanently delete tasks
│   │   ├── SearchFilterBar.tsx               # Search box, tag selector & status filters
│   │   ├── TaskCard.tsx                      # Task card with tags & progress bar
│   │   ├── TaskModal.tsx                     # Create & Edit task dialog with tag input
│   │   └── TaskStats.tsx                     # Metric cards & overall milestone progress bar
│   ├── lib/
│   │   ├── auth.ts                           # JWT signing & cookie verification
│   │   ├── db.ts                             # Database layer with atomic file writes
│   │   └── utils.ts                          # Classname, greetings and date helpers
│   └── middleware.ts                         # Next.js route protection & redirects
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📦 Scripts

- `npm run dev` — Starts the local Next.js development server at [http://localhost:3000](http://localhost:3000)
- `npm run build` — Compiles and optimizes the application for production
- `npm run start` — Runs the production build
- `npm run lint` — Runs Next.js ESLint checks
>>>>>>> f81bd18 (Initial website build)
