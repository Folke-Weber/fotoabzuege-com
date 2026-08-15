const PRICES = {
  "10x10": 0.49,
  "10x15": 0.49,
  "10xVario": 3.99,

  "13x13": 0.99,
  "13x18": 0.99,
  "13xVario": 4.99,

  "15x15": 1.95,
  "15x20": 2.95,
  "15x21": 2.95,
  "15x23": 2.95,
  "15xVario": 6.99,

  "20x20": 6.99,
  "20x28": 7.99,
  "20x30": 7.99,
  "20xVario": 9.99,

  "24x30": 10.95,
  "25x38": 14.99,
  "28x35": 14.99,

  "30x30": 14.99,
  "30x40": 14.99,
  "30x42": 14.99,
  "30x45": 14.99,
  "30x48": 14.99,

  "30xVario": 24.99
};

const SHIPPING = {
  pickup: 0,
  post: 7.69,
  hermes: 5.19
};

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

function cleanText(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.UPLOAD_SECRET) {
      return json({
        ok: false,
        error: "UPLOAD_SECRET fehlt."
      }, 500);
    }

    if (!env.BUCKET) {
      return json({
        ok: false,
        error: "R2-Bucket ist nicht verbunden."
      }, 500);
    }

    let data;

    try {
      data = await request.json();
    } catch {
      return json({
        ok: false,
        error: "Ungültige Bestelldaten."
      }, 400);
    }

    const firstName = cleanText(data.firstName, 100);
    const lastName = cleanText(data.lastName, 100);
    const email = cleanText(data.email, 200);
    const phone = cleanText(data.phone, 50);

    const shipping = cleanText(data.shipping, 20);

    const street = cleanText(data.street, 200);
    const zip = cleanText(data.zip, 20);
    const city = cleanText(data.city, 100);

    const surface =
      data.surface === "Matt" ? "Matt" : "Glänzend";

    if (!firstName || !lastName || !email) {
      return json({
        ok: false,
        error: "Vorname, Nachname und E-Mail sind erforderlich."
      }, 400);
    }

    if (!["pickup", "post", "hermes"].includes(shipping)) {
      return json({
        ok: false,
        error: "Ungültige Lieferart."
      }, 400);
    }

    if (shipping !== "pickup" && (!street || !zip || !city)) {
      return json({
        ok: false,
        error: "Für den Versand wird eine vollständige Adresse benötigt."
      }, 400);
    }

    const incomingItems = Array.isArray(data.items)
      ? data.items
      : [];

    const items = [];

    let photoTotal = 0;
    let printCount = 0;

    for (const item of incomingItems) {
      const format = cleanText(item.format, 40);
      const filename = cleanText(item.filename, 250);

      const quantity = Number(item.quantity);

      if (!(format in PRICES)) {
        return json({
          ok: false,
          error: `Ungültiges Format: ${format}`
        }, 400);
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 999
      ) {
        return json({
          ok: false,
          error: "Ungültige Stückzahl."
        }, 400);
      }

      const unitPrice = PRICES[format];
      const lineTotal = Number(
        (unitPrice * quantity).toFixed(2)
      );

      photoTotal += lineTotal;
      printCount += quantity;

      items.push({
        filename,
        format,
        quantity,
        unitPrice,
        lineTotal
      });
    }

    photoTotal = Number(photoTotal.toFixed(2));

    const shippingCost = SHIPPING[shipping];

    const total = Number(
      (photoTotal + shippingCost).toFixed(2)
    );

    const orderId = makeOrderId();

    const createdAt = new Date().toISOString();

    const orderData = {
      orderId,
      createdAt,
      status: "uploading",

      customer: {
        firstName,
        lastName,
        email,
        phone
      },

      delivery: {
        type: shipping,
        street: shipping === "pickup" ? "" : street,
        zip: shipping === "pickup" ? "" : zip,
        city: shipping === "pickup" ? "" : city
      },

      surface,

      items,

      totals: {
        imageFiles: items.length,
        prints: printCount,
        photos: photoTotal,
        shipping: shippingCost,
        total
      }
    };

    await env.BUCKET.put(
      `orders/${orderId}/order.json`,
      JSON.stringify(orderData, null, 2),
      {
        httpMetadata: {
          contentType: "application/json; charset=utf-8"
        }
      }
    );

    // Upload-Berechtigung für 2 Stunden
    const expires =
      Date.now() + (2 * 60 * 60 * 1000);

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
      totals: orderData.totals
    });

  } catch (error) {
    return json({
      ok: false,
      error: "Bestellung konnte nicht angelegt werden.",
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
