# 10-domain-change-document.md

## Purpose
This change updates the platform to support the new public domain and application subdomain:

- `https://signalbridges.com` (marketing / root domain)
- `https://app.signalbridges.com` (React application)

Backend API hostnames remain unchanged. The primary technical impact is **tight, explicit CORS allowlisting** for the new browser origins to prevent CORS failures while maintaining a defense-safe security posture.

## Old vs New Domain Architecture
### Before
- **Frontend (React):** `https://demo.canalerts.com`
- **Backend APIs:** unchanged (existing hosts)
- **TLS termination:** Google-managed infrastructure

### After
- **Frontend (React):** `https://app.signalbridges.com`
- **Root domain:** `https://signalbridges.com`
- **Backend APIs:** unchanged (existing hosts)
- **TLS termination:** Google-managed infrastructure

## Exact CORS Changes Made
### Backend (Flask) authoritative CORS configuration
File:

```python
algo-bridge-backend/config/app_config.py
```

Change:
- Added **two explicit production origins** to the CORS allowlist.
- **No wildcard origins** were introduced.
- Existing allowed origins were retained to avoid breaking existing clients.

New allowlist entries added:

```text
https://app.signalbridges.com
https://signalbridges.com
```

Resulting snippet (authoritative):

```python
allowed_origins = [
    "https://demo.canalerts.com",  # Production frontend
    "https://app.signalbridges.com",
    "https://signalbridges.com",
    "http://localhost:5173",      # Vite dev server
    "http://localhost:5177",      # Alternative Vite port
    "http://localhost:3000"       # React dev server
]

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": allowed_origins,
            "supports_credentials": True,
            "allow_headers": [
                "Content-Type", "Authorization", "X-Requested-With",
                "Accept", "Origin", "Cache-Control"
            ],
            "expose_headers": ["X-Request-ID"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "max_age": 86400,
        }
    }
)
```

### Preflight (OPTIONS) behavior
Preflight requests are expected to succeed due to:

- `flask-cors` handling for `OPTIONS` requests on `/api/*`
- an explicit bypass in the auth decorator to allow unauthenticated `OPTIONS`:

```python
# algo-bridge-backend/utils/auth_utils.py
if request.method == 'OPTIONS':
    return jsonify({'ok': True}), 200
```

## Environment Variables Added or Modified
- None for this change.

(If you later choose to make CORS origins configurable by environment, introduce a single env var such as `CORS_ALLOWED_ORIGINS` and parse it as a strict comma-separated allowlist. That is **not** part of this change.)

## Cookie / Auth Considerations
- Backend auth is primarily via `Authorization: Bearer <token>`.
- CORS is configured with `supports_credentials=True`, which will emit `Access-Control-Allow-Credentials: true`.
  - This is compatible with cookies **if** you ever choose to use them.
  - Because credentials are allowed, **origins must remain explicit** (no `*`). This change preserves that.
- Backend indicates it is stateless; session configuration is a no-op.
- There is an optional hardening flag:
  - `REJECT_COOKIE_REQUESTS=true` (blocks requests carrying `Cookie` headers)

## Deployment Steps
### Backend
1. Deploy the backend service that serves the Flask app (host unchanged).
2. Ensure the deployed revision includes the updated file:
   - `algo-bridge-backend/config/app_config.py`

### Frontend
- No frontend code changes are required for this backend CORS update.
- Frontend hosting is assumed to already be moved to `https://app.signalbridges.com`.

## Verification Checklist
### CORS preflight from the new app origin
Run an `OPTIONS` preflight against a representative API endpoint (replace the URL with the real API host/route):

```bash
curl -i -X OPTIONS "https://<EXISTING_BACKEND_HOST>/api/health" \
  -H "Origin: https://app.signalbridges.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

Expected:
- HTTP `200` (or `204` depending on framework behavior)
- Response includes:
  - `Access-Control-Allow-Origin: https://app.signalbridges.com`
  - `Access-Control-Allow-Credentials: true`
  - `Access-Control-Allow-Methods` includes the requested method
  - `Access-Control-Allow-Headers` includes the requested headers

### Root domain origin (if it ever calls APIs directly)

```bash
curl -i -X OPTIONS "https://<EXISTING_BACKEND_HOST>/api/health" \
  -H "Origin: https://signalbridges.com" \
  -H "Access-Control-Request-Method: GET"
```

### Regression: existing frontend origin

```bash
curl -i -X OPTIONS "https://<EXISTING_BACKEND_HOST>/api/health" \
  -H "Origin: https://demo.canalerts.com" \
  -H "Access-Control-Request-Method: GET"
```

### Browser validation
- Load `https://app.signalbridges.com`.
- Exercise authenticated API calls.
- Confirm no CORS errors in browser devtools console/network.

## Rollback Plan
1. Revert the backend change in:
   - `algo-bridge-backend/config/app_config.py`
2. Redeploy the previous known-good backend revision.
3. Verify that:
   - `https://demo.canalerts.com` continues to function
   - `https://app.signalbridges.com` will no longer be allowed (expected after rollback)

## Future Considerations
- Consider migrating to a dedicated API hostname such as:
  - `https://api.signalbridges.com`
  - Benefits:
    - clearer separation of concerns
    - simpler firewall/allowlist policies
    - cleaner security review boundaries
- If introducing `api.signalbridges.com`, keep CORS origins explicit and minimal (continue to avoid wildcards).
- If additional headers become necessary for browser clients, add them narrowly to `allow_headers` and document the rationale (avoid broad patterns).
