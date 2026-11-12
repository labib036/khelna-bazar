# GitHub Step-by-Step Guide for KHELNA BAZAR

This guide explains how to store your KHELNA BAZAR code in **GitHub** so you can easily deploy it to Vercel and never lose your work.

---

## 1. What is GitHub?
Think of GitHub as **Google Drive or Dropbox for code**. It keeps a secure backup of all your project files and tracks every change you make over time.

---

## 2. Step 1: Create a GitHub Account
1. Open your web browser and go to **[https://github.com](https://github.com)**.
2. Click **Sign up**.
3. Enter your email, create a secure password, and choose a username.
4. Verify your email address by clicking the link sent to your inbox.

---

## 3. Step 2: Create a New GitHub Repository
1. Log into your GitHub account.
2. In the top-right corner, click the **`+`** plus icon and select **New repository**.
3. **Repository name**: Type `khelna-bazar`.
4. **Description**: `Full-Stack Toy E-Commerce Store with Cash on Delivery`.
5. **Public or Private**: Choose **Private** (recommended so your store files are private to you) or Public.
6. **Important**: Under "Initialize this repository with:", **DO NOT** check "Add a README file", ".gitignore", or "license" (because our project already contains all these files!).
7. Click the green **Create repository** button.

---

## 4. Step 3: Initialize Git and Push from VS Code

Open your VS Code terminal in the project directory (`c:\Techspire Labs\Khelna Bazar By Labib`) and run these exact commands one by one:

### Command 1: Initialize Git
```bash
git init
```

### Command 2: Configure Your Git Identity (First time only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```
*(Replace with your real name and GitHub email)*

### Command 3: Stage all project files
```bash
git add .
```

### Command 4: Create the first commit
```bash
git commit -m "feat: complete Khelna Bazar e-commerce build with COD only"
```

### Command 5: Rename branch to main
```bash
git branch -M main
```

### Command 6: Link to your GitHub repository
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/khelna-bazar.git
```
*(Replace `YOUR_GITHUB_USERNAME` with your real GitHub account name)*

### Command 7: Push to GitHub
```bash
git push -u origin main
```
*A small popup window or browser tab may ask you to sign in to GitHub to authorize the upload. Sign in and grant access.*

---

## 5. Verifying Your Upload
1. Refresh your browser page on `https://github.com/YOUR_GITHUB_USERNAME/khelna-bazar`.
2. You will see all your files (`src/`, `prisma/`, `README.md`, etc.) safely stored on GitHub!
3. Notice that your `.env` file was **NOT** uploaded—our `.gitignore` automatically protected your secrets from being exposed on GitHub!

---

## 6. Pushing Future Updates
Whenever you make changes to files in VS Code and want to update GitHub, just run:
```bash
git add .
git commit -m "update: added new toys and settings"
git push
```
Your live site on Vercel will automatically detect the push and update itself!
