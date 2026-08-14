const ALLOWED_FORMATS = new Set([
  "10x10","10x15","10xVario",
  "13x13","13x18","13xVario",
  "15x15","15x20","15x21","15x23","15xVario",
  "20x20","20x28","20x30","20xVario",
  "24x30","25x38","28x35",
  "30x30","30x40","30x42","30x45","30x48","30xVario"
]);

const ALLOWED_TYPES = new Set([
  "image/jpeg","image/png","image/webp","image/heic","image/heif","application/octet-stream"
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function validUploadToken(orderId, token, secret) {
  if (!token || !secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const expires = Number(parts[0]);
  const signature = parts[1];

  if (!Number.isFinite(expires) || expires < Date.now()) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${orderId}.${expires}`)
  );

  return toHex(signed) === signature;
}

function safeName(name) {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return (cleaned || "bild.jpg").slice(-140);
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.BUCKET) {
      return json({ ok: false, error: "R2-Bucket ist nicht verbunden." }, 500);
    }

    if (!env.UPLOAD_SECRET) {
      return json({ ok: false, error: "Upload-Sicherheit ist noch nicht eingerichtet." }, 503);
    }

    const orderId = request.headers.get("x-order-id") || "";
    const token = request.headers.get("x-upload-token") || "";
    const encodedName = request.headers.get("x-filename") || "";
    const format = request.headers.get("x-format") || "";
    const surfaceCode = request.headers.get("x-surface") || "";
    const quantity = Number(request.headers.get("x-quantity") || "1");
    const contentType = (request.headers.get("content-type") || "application/octet-stream")
      .split(";")[0]
      .trim()
      .toLowerCase();

    if (!/^[a-zA-Z0-9-]{10,80}$/.test(orderId)) {
      return json({ ok: false, error: "Ungültige Bestellnummer." }, 400);
    }

    if (!(await validUploadToken(orderId, token, env.UPLOAD_SECRET))) {
      return json({ ok: false, error: "Upload-Berechtigung ungültig oder abgelaufen." }, 403);
    }

    let originalName = "bild.jpg";
    try {
      originalName = decodeURIComponent(encodedName);
    } catch {
      originalName = encodedName || "bild.jpg";
    }

    if (!ALLOWED_FORMATS.has(format)) {
      return json({ ok: false, error: "Ungültiges Bildformat." }, 400);
    }

    if (!["glossy", "matte"].includes(surfaceCode)) {
      return json({ ok: false, error: "Ungültige Oberfläche." }, 400);
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
      return json({ ok: false, error: "Ungültige Stückzahl." }, 400);
    }

    if (!ALLOWED_TYPES.has(contentType)) {
      return json({ ok: false, error: "Dieser Dateityp ist nicht erlaubt." }, 415);
    }

    if (!request.body) {
      return json({ ok: false, error: "Keine Bilddatei empfangen." }, 400);
    }

    const objectKey = `orders/${orderId}/${crypto.randomUUID()}-${safeName(originalName)}`;
    const surface = surfaceCode === "glossy" ? "Glänzend" : "Matt";

    const object = await env.BUCKET.put(objectKey, request.body, {
      httpMetadata: { contentType },
      customMetadata: {
        orderId,
        originalName: encodeURIComponent(originalName),
        format,
        surface,
        quantity: String(quantity),
        uploadedAt: new Date().toISOString()
      }
    });

    return json({
      ok: true,
      key: object.key,
      size: object.size,
      etag: object.etag
    });
  } catch (error) {
    return json({
      ok: false,
      error: "Upload fehlgeschlagen.",
      detail: String(error?.message || error)
    }, 500);
  }
}

export function onRequestGet() {
  return json({ ok: false, error: "Nur POST erlaubt." }, 405);
}
