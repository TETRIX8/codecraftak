// Global fetch proxy: routes all external HTTP(S) requests through the CDN.
// CDN expects: https://nqob2o1uqi.a.trbcdn.net/<original-full-url>

const CDN_BASE = "https://nqob2o1uqi.a.trbcdn.net";

// Hosts that must NOT be proxied (local dev, the CDN itself, blob/data URIs).
const SKIP_HOSTS = new Set<string>([
  "localhost",
  "127.0.0.1",
  "nqob2o1uqi.a.trbcdn.net",
]);

function shouldProxy(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("blob:") || url.startsWith("data:")) return false;
  if (url.startsWith("/")) return false; // same-origin relative
  try {
    const u = new URL(url, window.location.href);
    if (u.origin === window.location.origin) return false;
    if (SKIP_HOSTS.has(u.hostname)) return false;
    if (!/^https?:$/.test(u.protocol)) return false;
    return true;
  } catch {
    return false;
  }
}

function rewrite(url: string): string {
  try {
    const u = new URL(url, window.location.href);
    return `${CDN_BASE}/${u.toString()}`;
  } catch {
    return url;
  }
}

export function installCdnProxy() {
  if (typeof window === "undefined") return;
  if ((window as any).__cdnProxyInstalled) return;
  (window as any).__cdnProxyInstalled = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    try {
      if (typeof input === "string") {
        if (shouldProxy(input)) return originalFetch(rewrite(input), init);
      } else if (input instanceof URL) {
        const s = input.toString();
        if (shouldProxy(s)) return originalFetch(rewrite(s), init);
      } else if (input instanceof Request) {
        if (shouldProxy(input.url)) {
          const proxied = new Request(rewrite(input.url), input);
          return originalFetch(proxied, init);
        }
      }
    } catch {
      /* fall through to original */
    }
    return originalFetch(input as any, init);
  }) as typeof window.fetch;

  // Proxy XHR as well (Supabase realtime uses fetch, but some libs use XHR).
  const OriginalXHR = window.XMLHttpRequest;
  class ProxiedXHR extends OriginalXHR {
    open(
      method: string,
      url: string | URL,
      async: boolean = true,
      username?: string | null,
      password?: string | null,
    ): void {
      const s = typeof url === "string" ? url : url.toString();
      const finalUrl = shouldProxy(s) ? rewrite(s) : s;
      // @ts-expect-error - overloaded signature
      super.open(method, finalUrl, async, username, password);
    }
  }
  window.XMLHttpRequest = ProxiedXHR as any;
}
