# Beginner's Guide: Understanding and Running KHELNA BAZAR

Welcome to **KHELNA BAZAR**! If you have never coded, never used a terminal, and never deployed a website before, **do not worry**. This guide is written specifically for you.

---

## 1. What Are the Core Concepts?

Before typing commands, let's understand what each tool does in everyday language:

1. **Next.js & React**: This is the "engine" that builds your website. It controls how pages look, how buttons respond when clicked, and how products appear on the screen.
2. **TypeScript**: A smart safety net that checks code for spelling mistakes and errors before running it.
3. **Tailwind CSS**: The paintbrush and styling system that gives KHELNA BAZAR its playful blue, sunny yellow, and clean card designs.
4. **Prisma**: The bridge between your website and your database. Instead of writing complex database code, Prisma lets you handle toys, prices, and orders in plain English.
5. **PostgreSQL / Neon**: The secure "filing cabinet" (database) in the cloud that stores your toys, customers, and orders permanently.
6. **Cash on Delivery (COD)**: The payment method where the customer doesn't pay online. They order with 1 tap, and pay cash directly to the courier (e.g. Steadfast, Pathao) when the package arrives at their door.
7. **VS Code**: Visual Studio Code, the free text editor where you view and edit files.
8. **Terminal / PowerShell**: The text window where you type commands to start or build your website.

---

## 2. Opening the Project in Visual Studio Code

1. Download and install **Visual Studio Code** from [code.visualstudio.com](https://code.visualstudio.com/) if you haven't already.
2. Open Visual Studio Code.
3. In the top menu bar, click **File** &rarr; **Open Folder...**.
4. Select the folder: `c:\Techspire Labs\Khelna Bazar By Labib`.
5. Click **Select Folder**.
6. You will see all the project files on the left sidebar.

---

## 3. Opening the Terminal in VS Code

1. In VS Code, look at the top menu and click **Terminal** &rarr; **New Terminal**.
2. A black panel will open at the bottom of your screen. This is where you can type commands.
3. Notice the prompt: it will say something like:
   `PS C:\Techspire Labs\Khelna Bazar By Labib>`

---

## 4. Running the Website for the First Time

Type this exact command and press **Enter**:
```bash
npm run dev
```

### What should happen?
You will see output similar to:
```
▲ Next.js 15.2.1
- Local:        http://localhost:3000
- Environments: .env
✓ Starting...
✓ Ready in 1500ms
```

### How to verify it worked:
1. Open Google Chrome, Brave, Safari, or Edge.
2. In the URL address bar at the top, type: `http://localhost:3000` and press Enter.
3. **Congratulations!** You will see the KHELNA BAZAR home page loaded with the toy banner, categories, best sellers, and mini-basket drawer!

---

## 5. Testing the Customer Journey

Try this test shopping flow:
1. On the home page, look at the top search bar. Type `Space Explorer` and press Enter.
2. Click on the product card to open the **Product Detail Page**.
3. Notice the price in Bangladeshi Taka (`৳3,450`), the child safety certifications, and the choking hazard badge.
4. Click **Add to Basket**. The mini-cart drawer will slide in from the right.
5. Click **Proceed to Cash on Delivery**.
6. Fill in a test name (e.g. `Labib Ahmed`), your phone number (`01712345678`), and delivery address in Dhaka.
7. Click **Confirm Cash on Delivery Order**.
8. Confetti will explode on your screen with your unique Order ID (e.g. `KB-100249`), a reminder to have cash ready for the courier, and a live fulfillment timeline!

---

## 6. Accessing the Owner Admin Dashboard

1. In your browser, go to `http://localhost:3000/login`.
2. Click the quick button: **👑 Admin** (or enter `admin@khelnabazar.com` / `Admin@Khelna123`).
3. You will enter the **Admin Dashboard**!
4. From here you can:
   * View live gross sales and pending cash in transit.
   * Go to **Orders & COD Cash** to confirm orders, assign couriers, and record cash collected.
   * Go to **Product Catalog** to add new toys or change prices.
   * Go to **Inventory Stock** to restock SKUs.
   * Go to **Coupons & Deals** to create promo discount codes.
   * Go to **Delivery & Store Settings** to change delivery charges.

---

## 7. How to Stop the Website

When you want to stop the local development server:
1. Click inside the Terminal window in VS Code.
2. Press **Ctrl + C** on your keyboard.
3. If asked `Terminate batch job (Y/N)?`, type `Y` and press Enter.
4. The server is now stopped.
