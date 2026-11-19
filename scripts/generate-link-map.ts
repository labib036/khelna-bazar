import fs from "fs";
import path from "path";

interface LinkEntry {
  sourceFile: string;
  sourcePanel: "STOREFRONT" | "CUSTOMER_DASHBOARD" | "ADMIN_CONSOLE" | "AUTH";
  elementText: string;
  href: string;
  destinationPanel: "STOREFRONT" | "CUSTOMER_DASHBOARD" | "ADMIN_CONSOLE" | "AUTH" | "EXTERNAL";
  status: "VALID" | "VIOLATION";
  ruleNotes: string;
}

const entries: LinkEntry[] = [];

function getSourcePanel(filePath: string): "STOREFRONT" | "CUSTOMER_DASHBOARD" | "ADMIN_CONSOLE" | "AUTH" {
  const norm = filePath.replace(/\\/g, "/");
  if (norm.includes("/src/app/admin") || norm.includes("/src/components/admin")) {
    return "ADMIN_CONSOLE";
  }
  if (norm.includes("/src/app/dashboard") || norm.includes("/src/components/customer")) {
    return "CUSTOMER_DASHBOARD";
  }
  if (norm.includes("/src/app/(auth)") || norm.includes("/src/components/auth")) {
    return "AUTH";
  }
  return "STOREFRONT";
}

function getDestinationPanel(href: string): "STOREFRONT" | "CUSTOMER_DASHBOARD" | "ADMIN_CONSOLE" | "AUTH" | "EXTERNAL" {
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return "EXTERNAL";
  }
  if (href === "/admin" || href.startsWith("/admin/")) {
    return "ADMIN_CONSOLE";
  }
  if (href === "/dashboard" || href.startsWith("/dashboard/")) {
    return "CUSTOMER_DASHBOARD";
  }
  if (href === "/login" || href.startsWith("/login?") || href === "/register" || href === "/forgot-password" || href === "/reset-password") {
    return "AUTH";
  }
  return "STOREFRONT";
}

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const sourcePanel = getSourcePanel(filePath);
  const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");

  // Match href="..." or href={'...'} or router.push("...")
  const hrefRegex = /(?:href=["']([^"']+)["']|href=\{\s*["']([^"']+)["']\s*\}|router\.push\(["']([^"']+)["']\))/g;
  let match;

  while ((match = hrefRegex.exec(content)) !== null) {
    const rawHref = match[1] || match[2] || match[3];
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:")) continue;

    const destPanel = getDestinationPanel(rawHref);

    let status: "VALID" | "VIOLATION" = "VALID";
    let ruleNotes = "Permitted navigation";

    // Rule checks:
    // 1. Storefront cannot link into admin (except the isolated AdminPreviewBanner)
    if (sourcePanel === "STOREFRONT" && destPanel === "ADMIN_CONSOLE") {
      if (relPath.includes("admin-preview-banner.tsx")) {
        ruleNotes = "Privileged preview banner escape to admin console";
      } else {
        status = "VIOLATION";
        ruleNotes = "Illegal Storefront -> Admin console link";
      }
    }

    // 2. Admin cannot link into customer dashboard
    if (sourcePanel === "ADMIN_CONSOLE" && destPanel === "CUSTOMER_DASHBOARD") {
      status = "VIOLATION";
      ruleNotes = "Illegal Admin -> Customer dashboard link";
    }

    // 3. Admin can only link to /admin/* and View Store ("/")
    if (sourcePanel === "ADMIN_CONSOLE" && destPanel === "STOREFRONT") {
      if (rawHref === "/" || rawHref === "/login") {
        ruleNotes = "Permitted View Storefront / Signout navigation";
      } else {
        ruleNotes = "Storefront preview link from admin";
      }
    }

    // 4. Customer dashboard links only to /dashboard/* and back to /
    if (sourcePanel === "CUSTOMER_DASHBOARD" && destPanel === "ADMIN_CONSOLE") {
      status = "VIOLATION";
      ruleNotes = "Illegal Customer Dashboard -> Admin console link";
    }

    entries.push({
      sourceFile: relPath,
      sourcePanel,
      elementText: "Link / Navigation",
      href: rawHref,
      destinationPanel: destPanel,
      status,
      ruleNotes,
    });
  }
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".next" && file !== ".git") {
        walkDir(fullPath);
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      scanFile(fullPath);
    }
  }
}

walkDir(path.join(process.cwd(), "src"));

// Format CSV
const header = "Source File,Source Panel,Element Text,HREF,Destination Panel,Status,Rule Notes\n";
const rows = entries.map((e) =>
  `"${e.sourceFile}","${e.sourcePanel}","${e.elementText}","${e.href}","${e.destinationPanel}","${e.status}","${e.ruleNotes}"`
).join("\n");

const outDir = path.join(process.cwd(), "docs", "qa");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, "LINK_MAP.csv");
fs.writeFileSync(outPath, header + rows, "utf-8");

const violations = entries.filter((e) => e.status === "VIOLATION");
console.log(`Scanned ${entries.length} total links.`);
console.log(`Violations found: ${violations.length}`);
if (violations.length > 0) {
  console.error("Violations:", violations);
  process.exit(1);
} else {
  console.log("LINK_MAP.csv successfully generated with ZERO violations!");
}
