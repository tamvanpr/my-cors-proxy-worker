export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrlString = url.searchParams.get('url');

    // ✅ Perbaikan: if (!targetUrlString) { ... }
    if (!targetUrlString) {
      return new Response('Error: Missing ?url= parameter', { status: 400 });
    }

    let targetUrl;
    try {
      targetUrl = new URL(targetUrlString);
    } catch (e) {
      return new Response('Error: Invalid URL in ?url=', { status: 400 });
    }

    const headers = new Headers(request.headers);
    
    // 🔑 Paksa format JPEG/WEBP untuk hindari AVIF
    headers.set('Accept', 'image/jpeg,image/jpg,image/png,image/webp,image/gif;q=0.9,*/*;q=0.5');
    headers.delete('CF-Connecting-IP');
    headers.delete('X-Forwarded-For');
    headers.delete('X-Real-IP');

    const proxyReq = new Request(targetUrl, {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'follow'
    });

    try {
      const res = await fetch(proxyReq);
      return new Response(res.body, {
        status: res.status,
        headers: res.headers
      });
    } catch (e) {
      return new Response(`Proxy failed: ${e.message}`, { status: 502 });
    }
  }
};
