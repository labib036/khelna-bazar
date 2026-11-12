# Neon PostgreSQL Database Guide for KHELNA BAZAR

This guide shows you how to set up a free **Neon Serverless PostgreSQL** database for KHELNA BAZAR in under 5 minutes.

---

## 1. Why Neon?
* **100% Free Tier**: Zero monthly charges.
* **Serverless Connection Pooling**: Prevents connection limit errors in Next.js serverless functions.
* **Instant Provisioning**: Fully managed in the cloud with zero database maintenance required.

---

## 2. Step-by-Step Neon Setup

### Step 1: Create a Free Neon Account
1. Open your browser and go to: **[https://neon.tech](https://neon.tech)**
2. Click the **Sign Up** button in the top right.
3. Sign in using your **GitHub** or **Google** account.

### Step 2: Create a New Project
1. Once logged into the Neon dashboard, click **Create Project**.
2. **Project Name**: Enter `khelna-bazar-db`.
3. **Region**: Select **Asia (Singapore) - ap-southeast-1** (This is geographically closest to Bangladesh, giving the lowest latency!).
4. **PostgreSQL Version**: Leave as default (Postgres 16 or 15).
5. Click **Create Project**.

### Step 3: Get Your Connection Strings
1. Once the project is created, Neon displays the **Connection Details** dashboard.
2. In the dropdown, choose **Prisma**.
3. You will see two connection strings:
   * **Pooled Connection (`DATABASE_URL`)**: Looks like:
     `postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
   * **Direct Connection (`DIRECT_URL`)**: Looks like:
     `postgresql://neondb_owner:YOUR_PASSWORD@ep-sample.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

### Step 4: Add to Your `.env` File
1. Open your project in VS Code.
2. Open the `.env` file in the root directory.
3. Replace the placeholder lines with your real Neon strings:
   ```env
   DATABASE_URL="postgresql://neondb_owner:YOUR_REAL_PASSWORD@ep-sample-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://neondb_owner:YOUR_REAL_PASSWORD@ep-sample.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```
4. Save the file (`Ctrl + S`).

---

## 3. Running Database Migrations & Seeding

With your `.env` configured, open your VS Code terminal and run:

### 1. Push Database Tables
```bash
npm run db:push
```
*What this does*: Creates all 25+ database tables (User, Product, Order, Category, Brand, Review, etc.) in your Neon database.

### 2. Seed Realistic Catalog Data
```bash
npm run db:seed
```
*What this does*: Populates your database with 60+ realistic toy products, 12 brands, categories, flash deals, coupons (`PLAY10`, `FREESHIP`), sample orders, and demo accounts (`admin@khelnabazar.com`, `staff@khelnabazar.com`, `customer@khelnabazar.com`).

---

## 4. Viewing Your Data in Neon Console
1. In your browser on [neon.tech](https://neon.tech), click on **Tables** on the left menu.
2. You will see all your live tables: `Product`, `Order`, `User`, `Cart`, `Review`, etc.
3. When customers place Cash on Delivery orders, they will appear immediately inside the `Order` table!
