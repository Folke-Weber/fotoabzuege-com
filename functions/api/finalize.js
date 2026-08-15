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

  if (!Number.isFinite(expires) || expires < Date.now()) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
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

export async function onRequestPost({ request, env }) {
  try {
    if (!env.BUCKET) {
      return json({
        ok: false,
        error: "R2-Bucket ist nicht verbunden."
      }, 500);
    }

    if (!env.UPLOAD_SECRET) {
      return json({
        ok: false,
        error: "UPLOAD_SECRET fehlt."
      }, 500);
    }

    let data;

    try {
      data = await request.json();
    } catch {
      return json({
        ok: false,
        error: "Ungültige Daten."
      }, 400);
    }

    const orderId = String(data.orderId || "");
    const token = String(data.uploadToken || "");

    if (!/^[a-zA-Z0-9-]{10,80}$/.test(orderId)) {
      return json({
        ok: false,
        error: "Ungültige Bestellnummer."
      }, 400);
    }

    const authorized = await validUploadToken(
      orderId,
      token,
      env.UPLOAD_SECRET
    );

    if (!authorized) {
      return json({
        ok: false,
        error: "Berechtigung ungültig oder abgelaufen."
      }, 403);
    }

    const orderKey = `orders/${orderId}/order.json`;

    const orderObject = await env.BUCKET.get(orderKey);

    if (!orderObject) {
      return json({
        ok: false,
        error: "Bestellung wurde nicht gefunden."
      }, 404);
    }

    const order = await orderObject.json();

    const prefix = `orders/${orderId}/`;

    const listed = await env.BUCKET.list({
      prefix,
      limit: 1000
    });

    const imageObjects = listed.objects.filter(
      obj => obj.key !== orderKey
    );

    const expectedFiles =
      Array.isArray(order.items)
        ? order.items.length
        : 0;

    if (imageObjects.length < expectedFiles) {
      return json({
        ok: false,
        error: "Noch nicht alle Bilder wurden übertragen.",
        expectedFiles,
        uploadedFiles: imageObjects.length
      }, 409);
    }

    order.status = "complete";
    order.completedAt = new Date().toISOString();

    order.upload = {
      expectedFiles,
      uploadedFiles: imageObjects.length,
      objects: imageObjects.map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded
      }))
    };

    await env.BUCKET.put(
      orderKey,
      JSON.stringify(order, null, 2),
      {
        httpMetadata: {
          contentType: "application/json; charset=utf-8"
        }
      }
    );

    return json({
      ok: true,
      orderId,
      status: "complete",
      uploadedFiles: imageObjects.length
    });

  } catch (error) {
    return json({
      ok: false,
      error: "Bestellung konnte nicht abgeschlossen werden.",
      detail: String(error?.message || error)
    }, 500);
  }
}

export function onRequestGet() {
  return json({
    ok: false,
    error: "Nur POST erlaubt."
  }, 405);
}
