# Vercel Free-Tier Deployment Guide for KHELNA BAZAR

This guide guides you through publishing **KHELNA BAZAR** live to the internet on **Vercel** for free.

---

## 1. What is Vercel?
**Vercel** is the world-class cloud platform created by the inventors of Next.js. It automatically builds, optimizes, and serves your website on high-speed global servers with free SSL (HTTPS) encryption.

---

## 2. Step 1: Create a Free Vercel Account
1. Open your browser and go to **[https://vercel.com](https://vercel.com)**.
2. Click **Sign Up**.
3. Choose **Continue with GitHub** (this links your Vercel account directly to your GitHub repository!).

---

## 3. Step 2: Import Your Repository into Vercel
1. On your Vercel Dashboard, click the **Add New...** button and choose **Project**.
2. Under **Import Git Repository**, locate your `khelna-bazar` repository.
3. Click the **Import** button next to it.

---

## 4. Step 3: Configure Environment Variables
On the configuration screen:
1. **Framework Preset**: Vercel will automatically detect `Next.js`.
2. Expand the **Environment Variables** section.
3. Add each of these variables (copying values from your local `.env` and Neon database):

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://neondb_owner:PASSWORD@...` | Your Neon pooled connection string |
| `DIRECT_URL` | `postgresql://neondb_owner:PASSWORD@...` | Your Neon direct connection string |
| `AUTH_SECRET` | `generate-any-32-char-random-string` | Used to encrypt session cookies |
| `NEXT_PUBLIC_SITE_NAME` | `KHELNA BAZAR` | Store brand title |
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | `৳` | Bangladeshi Taka symbol |

---

## 5. Step 4: Deploy Your Store
1. Click the blue **Deploy** button.
2. Vercel will start downloading the code, installing packages, generating the Prisma client, and building the Next.js pages.
3. In about 60–90 seconds, you will see fireworks on the screen with:
   **"Congratulations! What will you build next?"**
4. Click on the preview screenshot or the domain link (e.g., `https://khelna-bazar.vercel.app`).
5. **Your store is now live on the world wide web!**

---

## 6. Commercial Hosting & Cost Note
* **Vercel Hobby**: 100% free and ideal for personal projects, testing, and portfolio showcases.
* **Commercial Store Usage**: As stated in Vercel's Terms of Service, if your store begins processing significant commercial order volumes, you should consider upgrading to the Vercel Pro tier ($20/month) or deploying to a VPS (e.g. DigitalOcean, Railway, or VPS in Bangladesh) to comply with non-commercial Hobby terms.

---

## 7. Connecting Your Custom Domain (e.g. `khelnabazar.com`)
1. In Vercel, go to your project **Settings** &rarr; **Domains**.
2. Type your registered domain name (e.g. `khelnabazar.com`) and click **Add**.
3. Vercel will show you the exact DNS records (A Record: `76.76.21.21` or CNAME) to add inside your domain registrar (e.g. Namecheap, GoDaddy, or BTCL/BD domains).
4. Within a few minutes, your website will be live under your official brand domain with automated free SSL!
