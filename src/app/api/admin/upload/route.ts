import { NextRequest, NextResponse } from "next/server";
import { assertPermission } from "@/lib/permissions";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function detectImageType(buffer: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize: products.edit permission required
    const perm = await assertPermission("products.edit");
    if (!perm.success) {
      return NextResponse.json({ error: perm.error }, { status: 403 });
    }
    const actor = perm.user;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const productId = (formData.get("productId") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5MB size limit. Please upload an image under 5MB." },
        { status: 400 }
      );
    }

    // Inspect real bytes (magic numbers) to defeat extension/MIME spoofing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const detectedType = detectImageType(buffer);

    if (!detectedType) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Only JPEG, PNG, and WebP images are permitted. SVG, PDF, and script-bearing formats are strictly rejected.",
        },
        { status: 400 }
      );
    }

    const ext = detectedType === "image/jpeg" ? "jpg" : detectedType === "image/png" ? "png" : "webp";
    const randomName = `toy_${Date.now()}_${crypto.randomBytes(8).toString("hex")}.${ext}`;

    let publicUrl = "";

    // 1. Try Vercel Blob if token configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`products/${randomName}`, buffer, {
          access: "public",
          contentType: detectedType,
        });
        publicUrl = blob.url;
      } catch (blobError) {
        console.warn("Vercel Blob upload failed, falling back to database storage:", blobError);
      }
    }

    // 2. Fallback to resilient Database MediaAsset storage + optional local disk cache
    if (!publicUrl) {
      // Always persist image payload to database so serverless Vercel can serve it
      await db.mediaAsset.upsert({
        where: { fileName: randomName },
        create: {
          fileName: randomName,
          mimeType: detectedType,
          base64: buffer.toString("base64"),
          size: file.size,
        },
        update: {
          mimeType: detectedType,
          base64: buffer.toString("base64"),
          size: file.size,
        },
      });

      // Best-effort local filesystem write (for local development, safe against read-only Vercel serverless)
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const localFilePath = path.join(uploadDir, randomName);
        fs.writeFileSync(localFilePath, buffer);
      } catch {
        // Read-only serverless environment (e.g. AWS Lambda / Vercel /var/task), safe to ignore since DB holds asset
      }

      publicUrl = `/uploads/products/${randomName}`;
    }

    // Write audit log entry
    await db.auditLog.create({
      data: {
        actorId: actor.id,
        actorEmail: actor.email,
        action: "IMAGE_UPLOADED",
        entityType: "ProductImage",
        entityId: productId || randomName,
        after: { url: publicUrl, size: file.size, mimeType: detectedType },
      },
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: randomName,
      size: file.size,
      mimeType: detectedType,
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process image upload." },
      { status: 500 }
    );
  }
}
