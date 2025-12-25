# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CFProxy** is a Cloudflare Workers-based HTTP/HTTPS proxy service written in vanilla JavaScript. The project consists of two main ES modules:
- `worker.js` - Core proxy logic, request handling, security, and API
- `ui.js` - HTML/CSS/JS UI generator returning the web interface

This is a serverless application designed to run on Cloudflare's edge network with zero infrastructure costs.

## Development Commands

### Deployment
```bash
# Deploy to Cloudflare Workers
wrangler deploy

# Deploy to specific environment
wrangler deploy --env production
```

### Local Development
```bash
# Run locally with Wrangler (requires wrangler.toml configuration)
wrangler dev

# Test locally on http://localhost:8787
wrangler dev --local
```

### Testing the Proxy
```bash
# Health check
curl https://your-worker.workers.dev/health

# Test proxy via query parameter
curl "https://your-worker.workers.dev/?url=https://example.com"

# Test proxy via path
curl https://your-worker.workers.dev/https://example.com

# Test with API key (if SECRET env var is set)
curl -H "X-API-Key: your-secret" https://your-worker.workers.dev/?url=https://example.com
```

## Architecture

### Request Flow
1. **Authentication Check** (`checkAuth`) - Validates `X-API-Key` header against `env.SECRET` if configured
2. **Rate Limiting** (`checkRateLimit`) - In-memory Map tracking requests per IP (100 req/min default)
3. **CORS Handling** - OPTIONS preflight handled early, CORS headers added to all responses
4. **URL Extraction** (`extractTargetUrl`) - Supports 3 methods:
   - Query parameter: `?url=https://example.com`
   - Path-based: `/https://example.com` or `/example.com`
   - Standard HTTP proxy: Raw request URL (for `HTTP_PROXY` environment variable usage)
5. **Security Validation** (`isUrlSafe`) - Blocks private IPs, localhost, metadata endpoints
6. **Proxy Execution** (`handleProxyRequest`) - Fetches target with cleaned headers
7. **Response Processing**:
   - Redirects (301/302/etc) rewritten to proxy through worker
   - HTML content processed via `rewriteHtmlUrls` to fix relative paths
   - CORS headers added to all responses

### Security Architecture
- **Blocked Hosts**: Private IP ranges (10.x, 172.16.x, 192.168.x), localhost, cloud metadata endpoints
- **Header Cleaning**: Cloudflare-specific and proxy headers stripped before forwarding (`cleanHeaders`)
- **Protocol Restriction**: Only HTTP/HTTPS allowed, blocks other protocols
- **Optional API Key**: Set `SECRET` environment variable to require `X-API-Key` header

### Configuration System
All settings centralized in `CONFIG` object in worker.js:
```javascript
CONFIG = {
  VERSION,           // Displayed in UI footer and health endpoint
  RATE_LIMIT,        // Per-IP rate limiting (enabled/disabled, max requests, window)
  CACHE,             // Cloudflare cache settings (TTL, cache everything flag)
  SECURITY,          // Blocked hosts and headers to remove
}
```

### UI Module Pattern
`ui.js` exports a single function `getHtml(config)` that:
- Returns a complete HTML string (not a Response object)
- Uses Tailwind CSS via CDN (no build step)
- Injects `config.VERSION` into footer
- Contains all JavaScript inline (no external scripts)
- Supports dark mode via CSS `prefers-color-scheme`

## Key Implementation Details

### ES Module Imports
The project uses ES modules (`import`/`export`). When modifying imports:
- Use named exports: `export function getHtml(config)`
- Import syntax: `import { getHtml } from "./ui.js"`
- File extensions required in imports: `"./ui.js"` not `"./ui"`

### HTML Path Rewriting
The `rewriteHtmlUrls` function modifies HTML responses to fix relative paths:
- Absolute paths (`href="/"`) → `href="{proxyOrigin}/{targetOrigin}/"`
- Protocol-relative (`src="//"`) → `src="{proxyOrigin}/https://"`
- This enables browsing websites through the proxy without broken links

### Redirect Handling
Redirects are intercepted and rewritten to proxy through the worker:
```javascript
// Original: Location: https://example.com/path
// Rewritten: Location: https://worker.dev/https%3A%2F%2Fexample.com%2Fpath
```

### Rate Limiting
In-memory `Map` tracks IP → `{count, resetTime}`. Simple implementation:
- Clears entire Map if size > 10,000 (prevents memory bloat)
- No persistent storage (resets on worker restart)
- For production use, consider Cloudflare KV or Durable Objects

## Environment Variables

Configure in wrangler.toml or Cloudflare Dashboard:

```toml
[env.production.vars]
SECRET = "your-api-key-here"  # Optional: require X-API-Key header
```

## Important Constraints

### Cloudflare Workers Limitations
- **Request size**: 100MB max
- **CPU time**: 10ms (free), 50ms (paid)
- **Memory**: Limited, avoid large in-memory operations
- **No WebSocket support**: Workers cannot proxy WebSocket connections
- **Stateless**: Each request may hit different worker instance

### Security Considerations
- Do not proxy internal/private network addresses (enforced by `SECURITY.BLOCKED_HOSTS`)
- Rate limiting is per-instance (not global across all edge locations)
- API key transmitted in headers (use HTTPS only)
- No request body size validation (relies on Cloudflare's 100MB limit)

## Common Modifications

### Adjusting Rate Limits
Edit `CONFIG.RATE_LIMIT` in worker.js:
```javascript
RATE_LIMIT: {
  ENABLED: true,
  MAX_REQUESTS: 100,  // Increase/decrease as needed
  WINDOW_MS: 60000,   // 60 seconds
}
```

### Adding Blocked Domains
Add to `CONFIG.SECURITY.BLOCKED_HOSTS`:
```javascript
BLOCKED_HOSTS: [
  // ... existing entries
  "example.com",  // Block specific domain
  "malicious.",   // Block all subdomains of malicious.*
]
```

### Modifying Cache Behavior
Edit `CONFIG.CACHE` in worker.js:
```javascript
CACHE: {
  ENABLED: true,
  TTL: 3600,              // Cache duration in seconds
  CACHE_EVERYTHING: true, // Cache all content types
}
```

### UI Customization
The UI is entirely in `ui.js`. To modify:
1. Edit the HTML template string in `getHtml()`
2. Tailwind CSS classes can be changed (uses CDN, no build needed)
3. JavaScript is inline in `<script>` tags at bottom of template
4. Config object passed in contains `VERSION` and other settings
