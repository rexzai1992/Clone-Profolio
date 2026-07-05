import {
  CONTENT_OBJECT_KEY,
  CONTENT_VERSION,
  MAX_UPLOAD_BYTES,
  createContentDocument,
  isAllowedUploadType,
  validateContentDocument,
  validateSiteConfig,
  type ContentDocument
} from "@/lib/content-schema";

const ASSET_PREFIX = "/assets/";
const ADMIN_COOKIE = "profolio_admin";
const SESSION_TTL_SECONDS = 12 * 60 * 60;
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

type AdminEnv = Env & {
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};

interface AdminSettings {
  username: string;
  password: string;
  sessionSecret: string;
}

interface SessionPayload {
  username: string;
  exp: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function assetKeyFromPath(pathname: string): string | null {
  if (!pathname.startsWith(ASSET_PREFIX)) {
    return null;
  }

  const key = decodeURIComponent(pathname.slice(ASSET_PREFIX.length));
  if (!key || key.includes("..")) {
    return null;
  }

  return key;
}

function assetHeaders(object: R2ObjectBody): Headers {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  if (!headers.has("cache-control")) {
    headers.set("cache-control", IMMUTABLE_CACHE);
  }

  return headers;
}

function jsonResponse(value: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  if (!headers.has("cache-control")) {
    headers.set("cache-control", "no-store");
  }

  return new Response(JSON.stringify(value), {
    ...init,
    headers
  });
}

function methodNotAllowed(allowed: string[]) {
  return jsonResponse(
    { error: "Method Not Allowed" },
    {
      status: 405,
      headers: { allow: allowed.join(", ") }
    }
  );
}

function readAdminSettings(env: Env): AdminSettings | null {
  const adminEnv = env as AdminEnv;
  const password = adminEnv.ADMIN_PASSWORD;
  const sessionSecret = adminEnv.ADMIN_SESSION_SECRET;

  if (!password || !sessionSecret) {
    return null;
  }

  return {
    username: adminEnv.ADMIN_USERNAME || "admin",
    password,
    sessionSecret
  };
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array) {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  array.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify"
  ]);
}

async function signValue(value: string, secret: string) {
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(signature);
}

async function verifyValue(value: string, signature: string, secret: string) {
  const key = await hmacKey(secret);
  return crypto.subtle.verify("HMAC", key, base64UrlDecode(signature), encoder.encode(value));
}

async function hashValue(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  const length = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) {
    diff |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return diff === 0;
}

async function credentialsMatch(candidate: string, expected: string) {
  const [candidateHash, expectedHash] = await Promise.all([hashValue(candidate), hashValue(expected)]);
  return equalBytes(candidateHash, expectedHash);
}

function parseCookies(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = new Map<string, string>();
  cookieHeader.split(";").forEach((part) => {
    const [name, ...rest] = part.trim().split("=");
    if (!name) {
      return;
    }
    cookies.set(name, rest.join("="));
  });
  return cookies;
}

async function createSessionCookie(request: Request, settings: AdminSettings) {
  const payload: SessionPayload = {
    username: settings.username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  };
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await signValue(encodedPayload, settings.sessionSecret);
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${encodedPayload}.${signature}; HttpOnly${secure}; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

function clearSessionCookie() {
  return `${ADMIN_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}

async function readSession(request: Request, env: Env): Promise<SessionPayload | null> {
  const settings = readAdminSettings(env);
  if (!settings) {
    return null;
  }

  const cookie = parseCookies(request).get(ADMIN_COOKIE);
  if (!cookie) {
    return null;
  }

  const [encodedPayload, signature] = cookie.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const verified = await verifyValue(encodedPayload, signature, settings.sessionSecret).catch(() => false);
  if (!verified) {
    return null;
  }

  try {
    const payload = JSON.parse(decoder.decode(base64UrlDecode(encodedPayload))) as SessionPayload;
    if (!payload.username || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

async function requireSession(request: Request, env: Env) {
  const session = await readSession(request, env);
  if (!session) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

async function readSavedContent(env: Env): Promise<{ document: ContentDocument | null; errors: string[] }> {
  const object = await env.MEDIA.get(CONTENT_OBJECT_KEY);
  if (!object) {
    return { document: null, errors: [] };
  }

  try {
    const payload: unknown = JSON.parse(await object.text());
    const result = validateContentDocument(payload);
    return { document: result.value ?? null, errors: result.errors };
  } catch {
    return { document: null, errors: ["Saved content could not be parsed."] };
  }
}

async function handlePublicContent(request: Request, env: Env) {
  if (request.method !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  const { document, errors } = await readSavedContent(env);
  if (!document) {
    return jsonResponse({ error: "No saved content.", errors }, { status: 404 });
  }

  return jsonResponse(document);
}

async function handleAdminContent(request: Request, env: Env) {
  const unauthorized = await requireSession(request, env);
  if (unauthorized) {
    return unauthorized;
  }

  if (request.method === "GET") {
    const { document, errors } = await readSavedContent(env);
    if (!document) {
      return jsonResponse({ error: "No saved content.", errors }, { status: 404 });
    }
    return jsonResponse(document);
  }

  if (request.method !== "PUT") {
    return methodNotAllowed(["GET", "PUT"]);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be JSON." }, { status: 400 });
  }

  const body = payload && typeof payload === "object" && "site" in payload ? (payload as { site: unknown }).site : payload;
  const result = validateSiteConfig(body);
  if (!result.ok || !result.value) {
    return jsonResponse({ error: "Content is invalid.", errors: result.errors }, { status: 422 });
  }

  const document = createContentDocument(result.value);
  await env.MEDIA.put(CONTENT_OBJECT_KEY, JSON.stringify(document, null, 2), {
    httpMetadata: {
      contentType: "application/json; charset=utf-8",
      cacheControl: "no-store"
    }
  });

  return jsonResponse(document);
}

function extensionForType(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

function safeFileName(name: string, type: string) {
  const fallback = `image.${extensionForType(type)}`;
  const clean = (name || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  if (!clean) {
    return fallback;
  }

  return /\.[a-z0-9]+$/.test(clean) ? clean : `${clean}.${extensionForType(type)}`;
}

async function handleUpload(request: Request, env: Env) {
  const unauthorized = await requireSession(request, env);
  if (unauthorized) {
    return unauthorized;
  }

  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return jsonResponse({ error: "Upload must include a file field." }, { status: 400 });
  }
  if (!isAllowedUploadType(file.type)) {
    return jsonResponse({ error: "Only JPEG, PNG, WebP, and GIF images are allowed." }, { status: 415 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return jsonResponse({ error: "Image must be 8 MB or smaller." }, { status: 413 });
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const filename = `${crypto.randomUUID()}-${safeFileName(file.name, file.type)}`;
  const key = `admin/uploads/${year}/${month}/${filename}`;

  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: IMMUTABLE_CACHE
    }
  });

  return jsonResponse({
    url: `${ASSET_PREFIX}${key}`,
    key
  });
}

async function handleLogin(request: Request, env: Env) {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const settings = readAdminSettings(env);
  if (!settings) {
    return jsonResponse({ error: "Admin credentials are not configured." }, { status: 500 });
  }

  let payload: { username?: unknown; password?: unknown };
  try {
    payload = (await request.json()) as { username?: unknown; password?: unknown };
  } catch {
    return jsonResponse({ error: "Request body must be JSON." }, { status: 400 });
  }

  const username = typeof payload.username === "string" ? payload.username : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const [usernameOk, passwordOk] = await Promise.all([
    credentialsMatch(username, settings.username),
    credentialsMatch(password, settings.password)
  ]);

  if (!usernameOk || !passwordOk) {
    return jsonResponse({ error: "Invalid username or password." }, { status: 401 });
  }

  return jsonResponse(
    { ok: true, version: CONTENT_VERSION },
    {
      headers: {
        "set-cookie": await createSessionCookie(request, settings)
      }
    }
  );
}

function handleLogout() {
  return jsonResponse(
    { ok: true },
    {
      headers: {
        "set-cookie": clearSessionCookie()
      }
    }
  );
}

async function handleSession(request: Request, env: Env) {
  if (request.method !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  const session = await readSession(request, env);
  if (!session) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }

  return jsonResponse({
    authenticated: true,
    username: session.username,
    exp: session.exp
  });
}

function isAdminLoginPath(pathname: string) {
  return pathname === "/admin/login" || pathname === "/admin/login/";
}

function isProtectedAdminPath(pathname: string) {
  return pathname === "/admin" || pathname === "/admin/" || (pathname.startsWith("/admin/") && !isAdminLoginPath(pathname));
}

async function maybeProtectAdminPage(request: Request, env: Env) {
  const url = new URL(request.url);
  if (!isProtectedAdminPath(url.pathname)) {
    return null;
  }

  const session = await readSession(request, env);
  if (session) {
    return null;
  }

  const next = encodeURIComponent(url.pathname === "/admin" ? "/admin/" : `${url.pathname}${url.search}`);
  return Response.redirect(`${url.origin}/admin/login/?next=${next}`, 302);
}

async function handleAsset(request: Request, env: Env, key: string) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "GET, HEAD" }
    });
  }

  const object = await env.MEDIA.get(key);
  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(request.method === "HEAD" ? null : object.body, {
    headers: assetHeaders(object)
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const key = assetKeyFromPath(url.pathname);

    if (url.pathname === "/api/content") {
      return handlePublicContent(request, env);
    }
    if (url.pathname === "/api/admin/login") {
      return handleLogin(request, env);
    }
    if (url.pathname === "/api/admin/logout") {
      return handleLogout();
    }
    if (url.pathname === "/api/admin/session") {
      return handleSession(request, env);
    }
    if (url.pathname === "/api/admin/content") {
      return handleAdminContent(request, env);
    }
    if (url.pathname === "/api/admin/upload") {
      return handleUpload(request, env);
    }
    if (url.pathname.startsWith("/api/admin/")) {
      const unauthorized = await requireSession(request, env);
      return unauthorized ?? jsonResponse({ error: "Not Found" }, { status: 404 });
    }
    if (url.pathname.startsWith("/api/")) {
      return jsonResponse({ error: "Not Found" }, { status: 404 });
    }

    const adminRedirect = await maybeProtectAdminPage(request, env);
    if (adminRedirect) {
      return adminRedirect;
    }

    if (key) {
      return handleAsset(request, env, key);
    }

    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
