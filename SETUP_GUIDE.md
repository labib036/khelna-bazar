# Setup Guide for KHELNA BAZAR

This document gives the exact step-by-step setup procedure from a fresh computer to a running KHELNA BAZAR application.

---

## 1. System Requirements
* **Operating System**: Windows 10/11, macOS, or Linux.
* **Node.js**: Version 20.0.0 or higher.
* **Git**: Installed on your path.

---

## 2. Step-by-Step Installation

### Step 1: Open Terminal in the Project Directory
```powershell
cd "c:\Techspire Labs\Khelna Bazar By Labib"
```

### Step 2: Install Node Dependencies
```powershell
npm install
```

### Step 3: Setup Environment Configuration
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
*(On Mac/Linux: `cp .env.example .env`)*

### Step 4: Generate the Prisma Client
```powershell
npx prisma generate
```

### Step 5: (Optional) Connect Neon Database & Seed
If you have created your free database on [neon.tech](https://neon.tech):
1. Put your pooled and direct connection strings in `.env`.
2. Push the database schema:
   ```powershell
   npm run db:push
   ```
3. Seed the sample catalog and accounts:
   ```powershell
   npm run db:seed
   ```
*(Note: If you haven't set up Neon yet, skip this step! Khelna Bazar will seamlessly load the pre-configured rich mock catalog so you can test right away).*

### Step 6: Start the Development Server
```powershell
npm run dev
```

### Step 7: Open in Browser
Open: **[http://localhost:3000](http://localhost:3000)**

---

## 3. Verifying the Build Passes Cleanly
Before deploying, you can run:
```powershell
npm run build
```
This runs TypeScript checking and Next.js static asset compilation to guarantee zero compile errors!
