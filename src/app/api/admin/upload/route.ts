import { NextResponse } from "next/server";
import { mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { isAdminRequest, unauthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Image upload for the admin panel. Accepts multipart form data:
 *   - file: the image (JPG / PNG / WebP, max 8 MB)
 *   - type: "product" (default) or "site" — picks the destination folder
 *
 * Images are resized to fit within 1200x1200 and re-encoded as WebP, then
 * saved under public/uploads so they are served as static files.
 */
export async function POST(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  const kind = form.get("type") === "site" ? "site" : "product";

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "No file received." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { success: false, error: "Only JPG, PNG or WebP images are allowed." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { success: false, error: "Image is too large. Maximum 8 MB." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dir = path.join(process.cwd(), "public", "uploads", kind);
    await mkdir(dir, { recursive: true });

    const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.webp`;
    await sharp(buffer)
      .rotate() // respect EXIF orientation
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(dir, name));

    return NextResponse.json({ success: true, url: `/uploads/${kind}/${name}` });
  } catch (err) {
    console.error("[admin/upload] failed:", err);
    return NextResponse.json(
      { success: false, error: "Could not process the image. Try a different file." },
      { status: 500 }
    );
  }
}
