import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams?.path || [];
    if (!pathSegments.length) {
      return NextResponse.json({ error: "File not specified" }, { status: 400 });
    }

    // Security: Disallow directory traversal
    for (const segment of pathSegments) {
      if (
        segment.includes("..") ||
        segment.includes("/") ||
        segment.includes("\\") ||
        segment.trim() === ""
      ) {
        return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
      }
    }

    const filename = pathSegments[pathSegments.length - 1];

    // 1. Check local filesystem first (for local dev environments)
    try {
      const localFilePath = path.join(process.cwd(), "public", "uploads", ...pathSegments);
      if (fs.existsSync(localFilePath)) {
        const buffer = fs.readFileSync(localFilePath);
        const ext = path.extname(filename).toLowerCase();
        const mimeType =
          ext === ".png"
            ? "image/png"
            : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
            ? "image/gif"
            : ext === ".avif"
            ? "image/avif"
            : "image/jpeg";

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch {
      // Pass-through to database lookup (e.g., read-only filesystem on Vercel Lambda)
    }

    // 2. Query database MediaAsset table
    const asset = await db.mediaAsset.findUnique({
      where: { fileName: filename },
    });

    if (!asset) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const buffer = Buffer.from(asset.base64, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": asset.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Error serving uploaded media:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function HEAD(
  req: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const getRes = await GET(req, props);
  return new NextResponse(null, {
    status: getRes.status,
    headers: getRes.headers,
  });
}
