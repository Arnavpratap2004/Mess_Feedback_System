/**
 * The frontend is hosted on a different origin from this API, so every response
 * needs CORS headers. Set ALLOWED_ORIGINS (comma-separated) in production to
 * restrict which sites may call the API; when it is unset any origin is echoed
 * back, which is convenient for local development.
 */

const allowList = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');

  const allowedOrigin =
    allowList.length === 0
      ? (origin ?? '*')
      : origin && allowList.includes(origin)
        ? origin
        : allowList[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

/** JSON response with CORS headers applied. */
export function json(request: Request, body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: corsHeaders(request) });
}

/** Binary/file response with CORS headers applied. */
export function file(
  request: Request,
  body: Uint8Array,
  contentType: string,
  filename: string
): Response {
  return new Response(body as unknown as BodyInit, {
    status: 200,
    headers: {
      ...corsHeaders(request),
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename=${filename}`,
      'Content-Length': String(body.byteLength),
    },
  });
}

/** Shared handler for CORS preflight requests. */
export function preflight(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
