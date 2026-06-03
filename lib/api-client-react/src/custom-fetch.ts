export type CustomFetchOptions = RequestInit & {
  responseType?: "json" | "text" | "blob" | "auto";
};

export type ErrorType<T = unknown> = ApiError<T>;

export type BodyType<T> = T;

export type AuthTokenGetter = () => Promise<string | null> | string | null;

const NO_BODY_STATUS = new Set([204, 205, 304]);
const DEFAULT_JSON_ACCEPT = "application/json, application/problem+json";

// ---------------------------------------------------------------------------
// Module-level configuration
// ---------------------------------------------------------------------------

let _baseUrl: string | null = null;
let _authTokenGetter: AuthTokenGetter | null = null;

/**
 * Set a base URL that is prepended to every relative request URL
 * (i.e. paths that start with `/`).
 *
 * Useful for Expo bundles that need to call a remote API server.
 * Pass `null` to clear the base URL.
 */
export function setBaseUrl(url: string | null): void {
  _baseUrl = url ? url.replace(/\/+$/, "") : null;
}

/**
 * Register a getter that supplies a bearer auth token.  Before every fetch
 * the getter is invoked; when it returns a non-null string, an
 * `Authorization: Bearer <token>` header is attached to the request.
 *
 * Useful for Expo bundles making token-gated API calls.
 * Pass `null` to clear the getter.
 *
 * NOTE: This function should never be used in web applications where session
 * token cookies are automatically associated with API calls by the browser.
 */
export function setAuthTokenGetter(getter: AuthTokenGetter | null): void {
  _authTokenGetter = getter;
}

function isRequest(input: RequestInfo | URL): input is Request {
  return typeof Request !== "undefined" && input instanceof Request;
}

function resolveMethod(input: RequestInfo | URL, explicitMethod?: string): string {
  if (explicitMethod) return explicitMethod.toUpperCase();
  if (isRequest(input)) return input.method.toUpperCase();
  return "GET";
}

// Use loose check for URL — some runtimes (e.g. React Native) polyfill URL
// differently, so `instanceof URL` can fail.
function isUrl(input: RequestInfo | URL): input is URL {
  return typeof URL !== "undefined" && input instanceof URL;
}

function applyBaseUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (!_baseUrl) return input;
  const url = resolveUrl(input);
  // Only prepend to relative paths (starting with /)
  if (!url.startsWith("/")) return input;

  const absolute = `${_baseUrl}${url}`;
  if (typeof input === "string") return absolute;
  if (isUrl(input)) return new URL(absolute);
  return new Request(absolute, input as Request);
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (isUrl(input)) return input.toString();
  return input.url;
}

function mergeHeaders(...sources: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();

  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

function getMediaType(headers: Headers): string | null {
  const value = headers.get("content-type");
  return value ? value.split(";", 1)[0].trim().toLowerCase() : null;
}

function isJsonMediaType(mediaType: string | null): boolean {
  return mediaType === "application/json" || Boolean(mediaType?.endsWith("+json"));
}

function isTextMediaType(mediaType: string | null): boolean {
  return Boolean(
    mediaType &&
      (mediaType.startsWith("text/") ||
        mediaType === "application/xml" ||
        mediaType === "text/xml" ||
        mediaType.endsWith("+xml") ||
        mediaType === "application/x-www-form-urlencoded"),
  );
}

// Use strict equality: in browsers, `response.body` is `null` when the
// response genuinely has no content.  In React Native, `response.body` is
// always `undefined` because the ReadableStream API is not implemented —
// even when the response carries a full payload readable via `.text()` or
// `.json()`.  Loose equality (`== null`) matches both `null` and `undefined`,
// which causes every React Native response to be treated as empty.
function hasNoBody(response: Response, method: string): boolean {
  if (method === "HEAD") return true;
  if (NO_BODY_STATUS.has(response.status)) return true;
  if (response.headers.get("content-length") === "0") return true;
  if (response.body === null) return true;
  return false;
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function looksLikeJson(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function getStringField(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  const candidate = (value as Record<string, unknown>)[key];
  if (typeof candidate !== "string") return undefined;

  const trimmed = candidate.trim();
  return trimmed === "" ? undefined : trimmed;
}

function truncate(text: string, maxLength = 300): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function buildErrorMessage(response: Response, data: unknown): string {
  const prefix = `HTTP ${response.status} ${response.statusText}`;

  if (typeof data === "string") {
    const text = data.trim();
    return text ? `${prefix}: ${truncate(text)}` : prefix;
  }

  const title = getStringField(data, "title");
  const detail = getStringField(data, "detail");
  const message =
    getStringField(data, "message") ??
    getStringField(data, "error_description") ??
    getStringField(data, "error");

  if (title && detail) return `${prefix}: ${title} — ${detail}`;
  if (detail) return `${prefix}: ${detail}`;
  if (message) return `${prefix}: ${message}`;
  if (title) return `${prefix}: ${title}`;

  return prefix;
}

export class ApiError<T = unknown> extends Error {
  readonly name = "ApiError";
  readonly status: number;
  readonly statusText: string;
  readonly data: T | null;
  readonly headers: Headers;
  readonly response: Response;
  readonly method: string;
  readonly url: string;

  constructor(
    response: Response,
    data: T | null,
    requestInfo: { method: string; url: string },
  ) {
    super(buildErrorMessage(response, data));
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
  }
}

export class ResponseParseError extends Error {
  readonly name = "ResponseParseError";
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly response: Response;
  readonly method: string;
  readonly url: string;
  readonly rawBody: string;
  readonly cause: unknown;

  constructor(
    response: Response,
    rawBody: string,
    cause: unknown,
    requestInfo: { method: string; url: string },
  ) {
    super(
      `Failed to parse response from ${requestInfo.method} ${response.url || requestInfo.url} ` +
        `(${response.status} ${response.statusText}) as JSON`,
    );
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = response.status;
    this.statusText = response.statusText;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
    this.rawBody = rawBody;
    this.cause = cause;
  }
}

async function parseJsonBody(
  response: Response,
  requestInfo: { method: string; url: string },
): Promise<unknown> {
  const raw = await response.text();
  const normalized = stripBom(raw);

  if (normalized.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(normalized);
  } catch (cause) {
    throw new ResponseParseError(response, raw, cause, requestInfo);
  }
}

async function parseErrorBody(response: Response, method: string): Promise<unknown> {
  if (hasNoBody(response, method)) {
    return null;
  }

  const mediaType = getMediaType(response.headers);

  // Fall back to text when blob() is unavailable (e.g. some React Native builds).
  if (mediaType && !isJsonMediaType(mediaType) && !isTextMediaType(mediaType)) {
    return typeof response.blob === "function" ? response.blob() : response.text();
  }

  const raw = await response.text();
  const normalized = stripBom(raw);
  const trimmed = normalized.trim();

  if (trimmed === "") {
    return null;
  }

  if (isJsonMediaType(mediaType) || looksLikeJson(normalized)) {
    try {
      return JSON.parse(normalized);
    } catch {
      return raw;
    }
  }

  return raw;
}

function inferResponseType(response: Response): "json" | "text" | "blob" {
  const mediaType = getMediaType(response.headers);

  if (isJsonMediaType(mediaType)) return "json";
  if (isTextMediaType(mediaType) || mediaType == null) return "text";
  return "blob";
}

async function parseSuccessBody(
  response: Response,
  responseType: "json" | "text" | "blob" | "auto",
  requestInfo: { method: string; url: string },
): Promise<unknown> {
  if (hasNoBody(response, requestInfo.method)) {
    return null;
  }

  const effectiveType =
    responseType === "auto" ? inferResponseType(response) : responseType;

  switch (effectiveType) {
    case "json":
      return parseJsonBody(response, requestInfo);

    case "text": {
      const text = await response.text();
      return text === "" ? null : text;
    }

    case "blob":
      if (typeof response.blob !== "function") {
        throw new TypeError(
          "Blob responses are not supported in this runtime. " +
            "Use responseType \"json\" or \"text\" instead.",
        );
      }
      return response.blob();
  }
}

// --- Local Static Mock Database Fallback (for static deploys like Netlify) ---
let FALLBACK_CATEGORIES = [
  { id: 1, name: "Pooja Category", description: "Sacred ritual oils, dhoop, and temple essentials", imageUrl: "/hero-brass.png", productCount: 12 },
  { id: 2, name: "Chains and Bracelets", description: "Sacred Karungali and Rudraksha silver-capped jewelry", imageUrl: "/karungali_mala.png", productCount: 15 },
  { id: 3, name: "Elephant Heritage", description: "Majestic Netipattams and wall-hanging elephant heads", imageUrl: "/elephant_head.png", productCount: 8 },
  { id: 4, name: "Heritage Textiles", description: "Premium Kasavu Mundu and traditional Kerala attire", imageUrl: "/hero-textile.png", productCount: 10 },
  { id: 5, name: "Miniatures & Mini Chenda", description: "Handcrafted miniature musical instruments and icons", imageUrl: "/hero-dance.png", productCount: 20 },
  { id: 6, name: "Fragrances & Organic Soap", description: "Temple-inspired scents and handmade organic soaps", imageUrl: "/kalabham_perfume.png", productCount: 8 },
];

let FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "Pure Pooja Oil (700ml)",
    description: "Premium blend pooja oil for daily temple rituals and lamp lighting. Smoke-free and long-lasting.",
    price: 250,
    mrp: 300,
    imageUrl: "/pooja_oil.png",
    categoryId: 1,
    categoryName: "Pooja Category",
    stock: 50,
    material: "Natural Oils",
    size: "700ml",
    featured: true,
    isVisible: true,
    isNewArrival: false
  },
  {
    id: 2,
    name: "Nithya Agnihotra Dhoop",
    description: "Traditional dhoop for daily pooja. 18 pieces per box. Purifies the atmosphere with a divine fragrance.",
    price: 250,
    mrp: 300,
    imageUrl: "/dhoop.png",
    categoryId: 1,
    categoryName: "Pooja Category",
    stock: 100,
    material: "Herbal Extract",
    size: "18 pcs",
    featured: false,
    isVisible: true,
    isNewArrival: true
  },
  {
    id: 3,
    name: "Karungali Pure Silver Mala (8mm)",
    description: "Original Karungali (Ebony wood) beads capped with 925 pure silver. A sacred shield for protection and clarity.",
    price: 9000,
    mrp: 9500,
    imageUrl: "/karungali_mala.png",
    categoryId: 2,
    categoryName: "Chains and Bracelets",
    stock: 5,
    material: "Ebony Wood & 925 Silver",
    size: "30 inch",
    featured: true,
    isVisible: true,
    isNewArrival: true
  },
  {
    id: 4,
    name: "Rudraksha Pure Silver Bracelet",
    description: "Authentic Rudraksha beads with pure silver casing. Designed for spiritual balance and modern elegance.",
    price: 4500,
    mrp: 5000,
    imageUrl: "/rudraksha_bracelet.png",
    categoryId: 2,
    categoryName: "Chains and Bracelets",
    stock: 15,
    material: "Rudraksha & 925 Silver",
    size: "Standard",
    featured: true,
    isVisible: true,
    isNewArrival: false
  },
  {
    id: 5,
    name: "Ramachandran Wall Hanging Elephant Head",
    description: "Stunning 30-inch wall-hanging elephant head inspired by the legendary 'Thechikkottukavu Ramachandran'. Hand-painted with authentic textures.",
    price: 10000,
    mrp: 11000,
    imageUrl: "/elephant_head.png",
    categoryId: 3,
    categoryName: "Elephant Heritage",
    stock: 3,
    material: "High-density Fiber",
    size: "30 inch",
    featured: true,
    isVisible: true,
    isNewArrival: true
  },
  {
    id: 6,
    name: "Golden Netipattam (Small)",
    description: "Traditional elephant caparison for home decor. Handcrafted with shimmering gold-finish details and colorful tassels.",
    price: 1600,
    mrp: 2500,
    imageUrl: "/netipattam.png",
    categoryId: 3,
    categoryName: "Elephant Heritage",
    stock: 20,
    material: "Gold-finish Copper & Fabric",
    size: "14x10 inch",
    featured: false,
    isVisible: true,
    isNewArrival: false
  },
  {
    id: 7,
    name: "Premium Blue Border Mundu",
    description: "Traditional Kerala Mundu with a sophisticated deep blue border. Woven from ultra-soft fine cotton for maximum comfort.",
    price: 550,
    mrp: 600,
    imageUrl: "/hero-textile.png",
    categoryId: 4,
    categoryName: "Heritage Textiles",
    stock: 40,
    material: "Fine Cotton",
    size: "4 meters",
    featured: true,
    isVisible: true,
    isNewArrival: true
  },
  {
    id: 8,
    name: "Black Theyyam Printed Mundu",
    description: "A bold statement piece featuring traditional Theyyam motifs. Perfect for cultural events and heritage gatherings.",
    price: 600,
    mrp: 700,
    imageUrl: "/theyyam_mundu.png",
    categoryId: 4,
    categoryName: "Heritage Textiles",
    stock: 25,
    material: "Hand-printed Cotton",
    size: "4 meters",
    featured: false,
    isVisible: true,
    isNewArrival: false
  },
  {
    id: 9,
    name: "Miniature Chenda (Traditional Drum)",
    description: "Perfectly detailed miniature of Kerala's iconic 'Chenda'. Hand-carved wood with authentic skin tensioning.",
    price: 650,
    mrp: 750,
    imageUrl: "/chenda.png",
    categoryId: 5,
    categoryName: "Miniatures & Mini Chenda",
    stock: 30,
    material: "Wood & Leather",
    size: "3 inch",
    featured: true,
    isVisible: true,
    isNewArrival: true
  },
  {
    id: 10,
    name: "Kathakali Face Stand (Small)",
    description: "Miniature hand-painted Kathakali face on a wooden stand. A classic Kerala souvenir for your bookshelf.",
    price: 850,
    mrp: 1000,
    imageUrl: "/hero-dance.png",
    categoryId: 5,
    categoryName: "Miniatures & Mini Chenda",
    stock: 50,
    material: "Painted Wood",
    size: "12 inch",
    featured: true,
    isVisible: true,
    isNewArrival: false
  },
  {
    id: 11,
    name: "Divine Kalabham Perfume (50ml)",
    description: "A signature temple fragrance capturing the essence of sandalwood and divine rituals. Long-lasting and pure.",
    price: 1350,
    mrp: 1500,
    imageUrl: "/kalabham_perfume.png",
    categoryId: 6,
    categoryName: "Fragrances & Organic Soap",
    stock: 12,
    material: "Essential Oils",
    size: "50ml",
    featured: true,
    isVisible: true,
    isNewArrival: true
  },
  {
    id: 12,
    name: "Charcoal Organic Handmade Soap",
    description: "Detoxifying handmade soap with activated charcoal and traditional oils. Chemical-free and skin-friendly.",
    price: 200,
    mrp: 250,
    imageUrl: "/charcoal_soap.png",
    categoryId: 6,
    categoryName: "Fragrances & Organic Soap",
    stock: 40,
    material: "Activated Charcoal & Coconut Oil",
    size: "100g",
    featured: false,
    isVisible: true,
    isNewArrival: false
  },
  {
    id: 13,
    name: "Aranmula Kannadi Hand-Held",
    description: "Authentic metal mirror from Aranmula. A sacred object for prosperity and beauty. Hand-held model with traditional patterns.",
    price: 4500,
    mrp: 5500,
    imageUrl: "/aranmula_kannadi.png",
    categoryId: 3,
    categoryName: "Elephant Heritage",
    stock: 5,
    material: "Aranmula Metal Alloy",
    size: "5 inch",
    featured: true,
    isVisible: true,
    isNewArrival: true
  }
];

async function handleFetchError(res: Response, prefix: string): Promise<never> {
  let errMsg = res.statusText;
  try {
    const errJson = await res.json();
    errMsg = errJson.message || errJson.error || JSON.stringify(errJson);
  } catch (_) {}
  throw new Error(`${prefix}: ${errMsg}`);
}

export async function customFetch<T = unknown>(
  input: RequestInfo | URL,
  options: CustomFetchOptions = {},
): Promise<T> {
  const urlStr = resolveUrl(input);
  // Always use the fallback path when there's no dedicated API server base URL.
  // The "fallback" logic will then use Supabase directly if credentials are present,
  // or fall back to in-memory mock data if they are not.
  // NOTE: Previously this checked `window.location.hostname.includes("netlify.app")`,
  // which broke custom domains hosted on Netlify (products disappeared on refresh).
  const isFallbackNeeded = !_baseUrl || _baseUrl === "";

  // Read client-side Supabase credentials from Vite environment
  const supabaseUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) || "";
  const supabaseKey = (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) || "";
  
  const getSupabaseHeaders = () => ({
    "apikey": supabaseKey,
    "Authorization": `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  });

  // Intercept relative API routes in production to serve local mock arrays or direct Supabase REST
  if (isFallbackNeeded && urlStr.startsWith("/api")) {
    const cleanUrl = urlStr.split("?")[0];
    const { method = "GET", body: requestBody } = options;
    
    // 1. DELETE Product
    if (method === "DELETE" && cleanUrl.match(/^\/api\/products\/\d+$/)) {
      const id = parseInt(cleanUrl.split("/").pop() || "0", 10);
      
      if (supabaseUrl && supabaseKey) {
        try {
          // Get category ID first to decrement count later
          const getRes = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${id}&select=category_id`, {
            headers: getSupabaseHeaders(),
            method: "GET"
          });
          const getProducts = await getRes.json();
          const catId = getProducts[0]?.category_id;

          // Perform DELETE
          const delRes = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${id}`, {
            headers: getSupabaseHeaders(),
            method: "DELETE"
          });
          if (!delRes.ok) {
            await handleFetchError(delRes, "Failed to delete product from Supabase");
          }

          // Decrement category count if there's a category
          if (catId) {
            await fetch(`${supabaseUrl}/rest/v1/rpc/decrement_category_count`, {
              headers: getSupabaseHeaders(),
              method: "POST",
              body: JSON.stringify({ row_id: catId })
            });
          }

          return {} as unknown as T;
        } catch (err) {
          console.error("Direct Supabase DELETE error:", err);
          throw err;
        }
      } else {
        const exists = FALLBACK_PRODUCTS.some(prod => prod.id === id);
        if (exists) {
          FALLBACK_PRODUCTS = FALLBACK_PRODUCTS.filter(prod => prod.id !== id);
          return {} as unknown as T;
        }
      }
    }

    // 1b. DELETE Category
    if (method === "DELETE" && cleanUrl.match(/^\/api\/categories\/\d+$/)) {
      const id = parseInt(cleanUrl.split("/").pop() || "0", 10);

      if (supabaseUrl && supabaseKey) {
        try {
          const delRes = await fetch(`${supabaseUrl}/rest/v1/categories?id=eq.${id}`, {
            headers: getSupabaseHeaders(),
            method: "DELETE"
          });
          if (!delRes.ok) {
            await handleFetchError(delRes, "Failed to delete category from Supabase");
          }
          return {} as unknown as T;
        } catch (err) {
          console.error("Direct Supabase DELETE category error:", err);
          throw err;
        }
      } else {
        FALLBACK_CATEGORIES = FALLBACK_CATEGORIES.filter(cat => cat.id !== id);
        return {} as unknown as T;
      }
    }

    // 1c. PUT Category (Update)
    if (method === "PUT" && cleanUrl.match(/^\/api\/categories\/\d+$/)) {
      try {
        const id = parseInt(cleanUrl.split("/").pop() || "0", 10);
        const bodyData = typeof requestBody === "string" ? JSON.parse(requestBody) : requestBody;

        if (supabaseUrl && supabaseKey) {
          const dbCategory = {
            name: bodyData.name,
            description: bodyData.description,
            image_url: bodyData.imageUrl
          };

          const putRes = await fetch(`${supabaseUrl}/rest/v1/categories?id=eq.${id}`, {
            headers: getSupabaseHeaders(),
            method: "PATCH",
            body: JSON.stringify(dbCategory)
          });
          if (!putRes.ok) {
            await handleFetchError(putRes, "Failed to update category in Supabase");
          }
          const updatedList = await putRes.json();
          const updated = updatedList[0];
          if (!updated) {
            throw new Error("No category returned from Supabase");
          }
          return {
            id: Number(updated.id),
            name: updated.name,
            description: updated.description,
            imageUrl: updated.image_url,
            productCount: Number(updated.product_count || 0),
            createdAt: updated.created_at
          } as unknown as T;
        } else {
          const idx = FALLBACK_CATEGORIES.findIndex(cat => cat.id === id);
          if (idx !== -1) {
            FALLBACK_CATEGORIES[idx] = {
              ...FALLBACK_CATEGORIES[idx],
              name: bodyData.name,
              description: bodyData.description,
              imageUrl: bodyData.imageUrl
            };
            return FALLBACK_CATEGORIES[idx] as unknown as T;
          }
          throw new Error("Category not found");
        }
      } catch (e) {
        console.error("Failed to parse PUT categories body", e);
        throw e;
      }
    }

    if (method === "POST" && cleanUrl === "/api/products") {
      try {
        const bodyData = typeof requestBody === "string" ? JSON.parse(requestBody) : requestBody;
        
        if (supabaseUrl && supabaseKey) {
          // Get category name
          let catName = "Uncategorized";
          if (bodyData.categoryId && bodyData.categoryId !== 0) {
            const catRes = await fetch(`${supabaseUrl}/rest/v1/categories?id=eq.${bodyData.categoryId}&select=name`, {
              headers: getSupabaseHeaders(),
              method: "GET"
            });
            const cats = await catRes.json();
            catName = cats[0]?.name || "Uncategorized";
          }

          const dbProduct = {
            name: bodyData.name,
            description: bodyData.description,
            price: bodyData.price,
            mrp: bodyData.mrp,
            image_url: bodyData.imageUrl,
            category_id: bodyData.categoryId && bodyData.categoryId !== 0 ? bodyData.categoryId : null,
            category_name: catName,
            stock: bodyData.stock,
            material: bodyData.material,
            size: bodyData.size,
            featured: bodyData.featured,
            is_visible: bodyData.isVisible !== undefined ? bodyData.isVisible : true,
            is_new_arrival: bodyData.isNewArrival || false
          };

          const postRes = await fetch(`${supabaseUrl}/rest/v1/products`, {
            headers: getSupabaseHeaders(),
            method: "POST",
            body: JSON.stringify(dbProduct)
          });
          if (!postRes.ok) {
            await handleFetchError(postRes, "Failed to create product in Supabase");
          }
          const createdList = await postRes.json();
          const created = createdList[0];

          // Increment category count
          if (bodyData.categoryId && bodyData.categoryId !== 0) {
            await fetch(`${supabaseUrl}/rest/v1/rpc/increment_category_count`, {
              headers: getSupabaseHeaders(),
              method: "POST",
              body: JSON.stringify({ row_id: bodyData.categoryId })
            });
          }

          return {
            id: Number(created.id),
            name: created.name,
            description: created.description,
            price: Number(created.price),
            mrp: created.mrp ? Number(created.mrp) : undefined,
            imageUrl: created.image_url,
            categoryId: Number(created.category_id),
            categoryName: created.category_name,
            stock: Number(created.stock),
            material: created.material,
            size: created.size,
            featured: Boolean(created.featured),
            isVisible: Boolean(created.is_visible),
            isNewArrival: Boolean(created.is_new_arrival),
            createdAt: created.created_at
          } as unknown as T;
        } else {
          const catName = FALLBACK_CATEGORIES.find(c => c.id === bodyData.categoryId)?.name || "Uncategorized";
          const newProduct = {
            ...bodyData,
            id: FALLBACK_PRODUCTS.reduce((max, p) => Math.max(max, p.id), 0) + 1,
            categoryName: catName,
            createdAt: new Date().toISOString()
          };
          FALLBACK_PRODUCTS.push(newProduct);
          return newProduct as unknown as T;
        }
      } catch (e) {
        console.error("Failed to parse POST body", e);
        throw e;
      }
    }

    // 3. PUT Product (Update)
    if (method === "PUT" && cleanUrl.match(/^\/api\/products\/\d+$/)) {
      try {
        const id = parseInt(cleanUrl.split("/").pop() || "0", 10);
        const bodyData = typeof requestBody === "string" ? JSON.parse(requestBody) : requestBody;
        
        if (supabaseUrl && supabaseKey) {
          // Get category name
          let catName = "Uncategorized";
          if (bodyData.categoryId && bodyData.categoryId !== 0) {
            const catRes = await fetch(`${supabaseUrl}/rest/v1/categories?id=eq.${bodyData.categoryId}&select=name`, {
              headers: getSupabaseHeaders(),
              method: "GET"
            });
            const cats = await catRes.json();
            catName = cats[0]?.name || "Uncategorized";
          }

          const dbProduct = {
            name: bodyData.name,
            description: bodyData.description,
            price: bodyData.price,
            mrp: bodyData.mrp,
            image_url: bodyData.imageUrl,
            category_id: bodyData.categoryId && bodyData.categoryId !== 0 ? bodyData.categoryId : null,
            category_name: catName,
            stock: bodyData.stock,
            material: bodyData.material,
            size: bodyData.size,
            featured: bodyData.featured,
            is_visible: bodyData.isVisible !== undefined ? bodyData.isVisible : true,
            is_new_arrival: bodyData.isNewArrival || false
          };

          const putRes = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${id}`, {
            headers: getSupabaseHeaders(),
            method: "PATCH",
            body: JSON.stringify(dbProduct)
          });
          if (!putRes.ok) {
            await handleFetchError(putRes, "Failed to update product in Supabase");
          }
          const updatedList = await putRes.json();
          const updated = updatedList[0];

          return {
            id: Number(updated.id),
            name: updated.name,
            description: updated.description,
            price: Number(updated.price),
            mrp: updated.mrp ? Number(updated.mrp) : undefined,
            imageUrl: updated.image_url,
            categoryId: Number(updated.category_id),
            categoryName: updated.category_name,
            stock: Number(updated.stock),
            material: updated.material,
            size: updated.size,
            featured: Boolean(updated.featured),
            isVisible: Boolean(updated.is_visible),
            isNewArrival: Boolean(updated.is_new_arrival),
            createdAt: updated.created_at
          } as unknown as T;
        } else {
          const idx = FALLBACK_PRODUCTS.findIndex(prod => prod.id === id);
          if (idx !== -1) {
            const catName = FALLBACK_CATEGORIES.find(c => c.id === bodyData.categoryId)?.name || FALLBACK_PRODUCTS[idx].categoryName;
            FALLBACK_PRODUCTS[idx] = {
              ...FALLBACK_PRODUCTS[idx],
              ...bodyData,
              categoryName: catName
            };
            return FALLBACK_PRODUCTS[idx] as unknown as T;
          }
        }
      } catch (e) {
        console.error("Failed to parse PUT body", e);
        throw e;
      }
    }

    // 4. Categories List
    if (method === "GET" && cleanUrl === "/api/categories") {
      if (supabaseUrl && supabaseKey) {
        try {
          const catRes = await fetch(`${supabaseUrl}/rest/v1/categories?order=id.asc`, {
            headers: getSupabaseHeaders(),
            method: "GET"
          });
          const cats = await catRes.json();
          return cats.map((c: any) => ({
            id: Number(c.id),
            name: c.name,
            description: c.description,
            imageUrl: c.image_url,
            productCount: Number(c.product_count),
            createdAt: c.created_at
          })) as unknown as T;
        } catch (err) {
          console.error("Direct Supabase load categories error:", err);
          return FALLBACK_CATEGORIES as unknown as T;
        }
      } else {
        return FALLBACK_CATEGORIES as unknown as T;
      }
    }

    // 4b. Create Category
    if (method === "POST" && cleanUrl === "/api/categories") {
      try {
        const bodyData = typeof requestBody === "string" ? JSON.parse(requestBody) : requestBody;
        if (supabaseUrl && supabaseKey) {
          const dbCategory = {
            name: bodyData.name,
            description: bodyData.description,
            image_url: bodyData.imageUrl,
            product_count: 0
          };
          const postRes = await fetch(`${supabaseUrl}/rest/v1/categories`, {
            headers: getSupabaseHeaders(),
            method: "POST",
            body: JSON.stringify(dbCategory)
          });
          if (!postRes.ok) {
            await handleFetchError(postRes, "Failed to create category in Supabase");
          }
          const createdList = await postRes.json();
          const created = createdList[0];
          if (!created) {
            throw new Error("No category returned from Supabase");
          }
          return {
            id: Number(created.id),
            name: created.name,
            description: created.description,
            imageUrl: created.image_url,
            productCount: Number(created.product_count || 0),
            createdAt: created.created_at
          } as unknown as T;
        } else {
          const newCat = {
            id: FALLBACK_CATEGORIES.reduce((max, c) => Math.max(max, c.id), 0) + 1,
            name: bodyData.name,
            description: bodyData.description,
            imageUrl: bodyData.imageUrl,
            productCount: 0,
            createdAt: new Date().toISOString()
          };
          FALLBACK_CATEGORIES.push(newCat);
          return newCat as unknown as T;
        }
      } catch (e) {
        console.error("Failed to parse POST categories body", e);
        throw e;
      }
    }
    
    // 5. Products List
    if (cleanUrl === "/api/products") {
      const params = new URLSearchParams(urlStr.split("?")[1] || "");
      const cat = params.get("category");
      const search = params.get("search");
      const featured = params.get("featured") === "true";
      
      if (supabaseUrl && supabaseKey) {
        try {
          let queryParams = new URLSearchParams();
          queryParams.append("select", "*");
          queryParams.append("order", "id.desc");
          if (cat) queryParams.append("category_name", `eq.${cat}`);
          if (search) queryParams.append("name", `ilike.*${search}*`);
          if (featured) queryParams.append("featured", "eq.true");

          const prodRes = await fetch(`${supabaseUrl}/rest/v1/products?${queryParams.toString()}`, {
            headers: getSupabaseHeaders(),
            method: "GET"
          });
          const prods = await prodRes.json();
          return prods.map((p: any) => ({
            id: Number(p.id),
            name: p.name,
            description: p.description,
            price: Number(p.price),
            mrp: p.mrp ? Number(p.mrp) : undefined,
            imageUrl: p.image_url,
            categoryId: Number(p.category_id),
            categoryName: p.category_name,
            stock: Number(p.stock),
            material: p.material,
            size: p.size,
            featured: Boolean(p.featured),
            isVisible: Boolean(p.is_visible),
            isNewArrival: Boolean(p.is_new_arrival),
            createdAt: p.created_at
          })) as unknown as T;
        } catch (err) {
          console.error("Direct Supabase load products error:", err);
          let filtered = [...FALLBACK_PRODUCTS];
          if (cat) filtered = filtered.filter(p => p.categoryName === cat);
          if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
          if (featured) filtered = filtered.filter(p => p.featured);
          return filtered as unknown as T;
        }
      } else {
        let filtered = [...FALLBACK_PRODUCTS];
        if (cat) filtered = filtered.filter(p => p.categoryName === cat);
        if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        if (featured) filtered = filtered.filter(p => p.featured);
        
        return filtered as unknown as T;
      }
    }
    
    // 6. Product Details
    if (cleanUrl.match(/^\/api\/products\/\d+$/)) {
      const id = parseInt(cleanUrl.split("/").pop() || "0", 10);
      if (supabaseUrl && supabaseKey) {
        try {
          const prodRes = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${id}`, {
            headers: getSupabaseHeaders(),
            method: "GET"
          });
          const prods = await prodRes.json();
          const p = prods[0];
          if (p) {
            return {
              id: Number(p.id),
              name: p.name,
              description: p.description,
              price: Number(p.price),
              mrp: p.mrp ? Number(p.mrp) : undefined,
              imageUrl: p.image_url,
              categoryId: Number(p.category_id),
              categoryName: p.category_name,
              stock: Number(p.stock),
              material: p.material,
              size: p.size,
              featured: Boolean(p.featured),
              isVisible: Boolean(p.is_visible),
              isNewArrival: Boolean(p.is_new_arrival),
              createdAt: p.created_at
            } as unknown as T;
          }
          throw new Error("Product not found");
        } catch (err) {
          console.error("Direct Supabase load product details error:", err);
          const p = FALLBACK_PRODUCTS.find(prod => prod.id === id);
          if (p) return p as unknown as T;
        }
      } else {
        const p = FALLBACK_PRODUCTS.find(prod => prod.id === id);
        if (p) return p as unknown as T;
      }
    }
    
    // 7. Featured Hero Products
    if (cleanUrl === "/api/dashboard/featured") {
      if (supabaseUrl && supabaseKey) {
        try {
          const prodRes = await fetch(`${supabaseUrl}/rest/v1/products?featured=eq.true&order=id.desc`, {
            headers: getSupabaseHeaders(),
            method: "GET"
          });
          const prods = await prodRes.json();
          return prods.map((p: any) => ({
            id: Number(p.id),
            name: p.name,
            description: p.description,
            price: Number(p.price),
            mrp: p.mrp ? Number(p.mrp) : undefined,
            imageUrl: p.image_url,
            categoryId: Number(p.category_id),
            categoryName: p.category_name,
            stock: Number(p.stock),
            material: p.material,
            size: p.size,
            featured: Boolean(p.featured),
            isVisible: Boolean(p.is_visible),
            isNewArrival: Boolean(p.is_new_arrival),
            createdAt: p.created_at
          })) as unknown as T;
        } catch (err) {
          console.error("Direct Supabase load featured error:", err);
          return FALLBACK_PRODUCTS.filter(p => p.featured) as unknown as T;
        }
      } else {
        return FALLBACK_PRODUCTS.filter(p => p.featured) as unknown as T;
      }
    }
    
    // 8. Dashboard Statistics
    if (cleanUrl === "/api/dashboard/stats") {
      if (supabaseUrl && supabaseKey) {
        try {
          const [prodRes, catRes] = await Promise.all([
            fetch(`${supabaseUrl}/rest/v1/products`, { headers: getSupabaseHeaders(), method: "GET" }),
            fetch(`${supabaseUrl}/rest/v1/categories`, { headers: getSupabaseHeaders(), method: "GET" })
          ]);
          const prods = await prodRes.json();
          const cats = await catRes.json();

          const mappedProds = prods.map((p: any) => ({
            id: Number(p.id),
            name: p.name,
            description: p.description,
            price: Number(p.price),
            mrp: p.mrp ? Number(p.mrp) : undefined,
            imageUrl: p.image_url,
            categoryId: Number(p.category_id),
            categoryName: p.category_name,
            stock: Number(p.stock),
            material: p.material,
            size: p.size,
            featured: Boolean(p.featured),
            isVisible: Boolean(p.is_visible),
            isNewArrival: Boolean(p.is_new_arrival),
            createdAt: p.created_at
          }));

          return {
            totalProducts: mappedProds.length,
            totalCategories: cats.length,
            featuredProducts: mappedProds.filter((p: any) => p.featured).length,
            lowStockProducts: mappedProds.filter((p: any) => p.stock < 5).length,
            recentProducts: mappedProds.slice(-5).reverse()
          } as unknown as T;
        } catch (err) {
          console.error("Direct Supabase load stats error:", err);
          return {
            totalProducts: FALLBACK_PRODUCTS.length,
            totalCategories: FALLBACK_CATEGORIES.length,
            featuredProducts: FALLBACK_PRODUCTS.filter(p => p.featured).length,
            lowStockProducts: FALLBACK_PRODUCTS.filter(p => p.stock < 5).length,
            recentProducts: FALLBACK_PRODUCTS.slice(-5).reverse()
          } as unknown as T;
        }
      } else {
        return {
          totalProducts: FALLBACK_PRODUCTS.length,
          totalCategories: FALLBACK_CATEGORIES.length,
          featuredProducts: FALLBACK_PRODUCTS.filter(p => p.featured).length,
          lowStockProducts: FALLBACK_PRODUCTS.filter(p => p.stock < 5).length,
          recentProducts: FALLBACK_PRODUCTS.slice(-5).reverse()
        } as unknown as T;
      }
    }
  }

  input = applyBaseUrl(input);
  const { responseType = "auto", headers: headersInit, ...init } = options;

  const method = resolveMethod(input, init.method);

  if (init.body != null && (method === "GET" || method === "HEAD")) {
    throw new TypeError(`customFetch: ${method} requests cannot have a body.`);
  }

  const headers = mergeHeaders(isRequest(input) ? input.headers : undefined, headersInit);

  if (
    typeof init.body === "string" &&
    !headers.has("content-type") &&
    looksLikeJson(init.body)
  ) {
    headers.set("content-type", "application/json");
  }

  if (responseType === "json" && !headers.has("accept")) {
    headers.set("accept", DEFAULT_JSON_ACCEPT);
  }

  // Attach bearer token when an auth getter is configured and no
  // Authorization header has been explicitly provided.
  if (_authTokenGetter && !headers.has("authorization")) {
    const token = await _authTokenGetter();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
  }

  const requestInfo = { method, url: resolveUrl(input) };

  const response = await fetch(input, { ...init, method, headers });

  if (!response.ok) {
    const errorData = await parseErrorBody(response, method);
    throw new ApiError(response, errorData, requestInfo);
  }

  return (await parseSuccessBody(response, responseType, requestInfo)) as T;
}
