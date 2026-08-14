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

function randomCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));

  return [...bytes]
    .map(b => chars[b % chars.length])
    .join("");
}

function makeOrderId() {
  const d = new Date();

  const pad = n => String(n).padStart(2, "0");

  const stamp =
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "-" +
    pad(d.getHours()) +
    pad(d.getMinutes());

  return `FW-${stamp}-${randomCode(8)}`;
}

async function createUploadToken(orderId, expires, secret) {
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

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${orderId}.${expires}`)
  );

  return `${expires}.${toHex(signature)}`;
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.UPLOAD_SECRET) {
      return json({
        ok: false,
        error: "UPLOAD_SECRET fehlt."
      }, 500);
    }

    let data = {};

    try {
      data = await request.json();
    } catch {
      data = {};
    }

    const orderId = makeOrderId();

    // Upload-Berechtigung für 2 Stunden
    const expires = Date.now() + (2 * 60 * 60 * 1000);

    const uploadToken = await createUploadToken(
      orderId,
      expires,
      env.UPLOAD_SECRET
    );

    return json({
      ok: true,
      orderId,
      uploadToken,
      expires,
      customer: {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || ""
      }
    });

  } catch (error) {
    return json({
      ok: false,
      error: "Bestellnummer konnte nicht erzeugt werden.",
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
