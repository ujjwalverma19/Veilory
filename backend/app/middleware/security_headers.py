import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip applying custom security headers for developer docs pages to prevent asset blocking
        path = request.url.path
        if "/docs" in path or "/openapi.json" in path or "/redoc" in path:
            return await call_next(request)
            
        response: Response = await call_next(request)
        # Content Security Policy – allow resources only from self and trusted domains
        csp = (
            "default-src 'self'; "
            "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
            "style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
            "img-src 'self' data: https://fastapi.tiangolo.com; "
            "connect-src 'self' https://veilory-api.onrender.com;"
        )
        response.headers['Content-Security-Policy'] = csp
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        # Optional: enable HSTS for HTTPS only
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
        return response
