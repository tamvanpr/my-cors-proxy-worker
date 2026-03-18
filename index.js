export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrlString = url.searchParams.get('url');

    if (!targetUrlString) {
      return new Response('Error: Missing ?url= parameter', { status: 400 });
    }

    let targetUrl;
    try {
      targetUrl = new URL(targetUrlString);
    } catch (e) {
      return new Response('Error: Invalid URL in ?url=', { status: 400 });
    }

    // 🎯 MODIFIKASI UTAMA: Ganti User-Agent agar dianggap Firefox
    const headers = new Headers(request.headers);
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0');
    
    // Paksa format gambar JPEG/WebP (opsional, tapi aman)
    headers.set('Accept', 'image/jpeg,image/jpg,image/png,image/webp,image/gif;q=0.9,*/*;q=0.5');

    // Hapus header yang bisa mengungkapkan identitas proxy
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
