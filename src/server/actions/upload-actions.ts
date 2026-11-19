"use server";

import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/authorization-guards";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Server action to securely upload a custom toy product picture.
 * Enforces ADMIN or STAFF authorization.
 */
export async function uploadProductImageAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || !isStaffRole(session.user.role)) {
      return { success: false, error: "Unauthorized: Admin or Staff privileges required to upload images." };
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return { success: false, error: "No image file provided." };
    }

    // Size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Image file exceeds 5MB limit. Please upload an image under 5MB." };
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "Unsupported image format. Please upload JPG, PNG, WEBP, or GIF." };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext) ? ext : "jpg";
    const filename = `toy-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${safeExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let publicUrl = "";

    // 1. Try Vercel Blob if token configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`products/${filename}`, buffer, {
          access: "public",
          contentType: file.type,
        });
        publicUrl = blob.url;
      } catch (blobError) {
        console.warn("Vercel Blob upload failed, falling back to database storage:", blobError);
      }
    }

    // 2. Fallback to resilient Database MediaAsset storage + optional local disk cache
    if (!publicUrl) {
      await db.mediaAsset.upsert({
        where: { fileName: filename },
        create: {
          fileName: filename,
          mimeType: file.type,
          base64: buffer.toString("base64"),
          size: file.size,
        },
        update: {
          mimeType: file.type,
          base64: buffer.toString("base64"),
          size: file.size,
        },
      });

      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadsDir, { recursive: true });
        const filePath = path.join(uploadsDir, filename);
        await fs.writeFile(filePath, buffer);
      } catch {
        // Read-only serverless environment, safe to ignore
      }

      publicUrl = `/uploads/${filename}`;
    }

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { success: false, error: error.message || "Failed to upload image." };
  }
}
