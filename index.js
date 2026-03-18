/**
     * @typedef {Object} Env
     * @property {any} [ASSETS] - Bindings for static assets
     */

    /**
     * Handles the main request logic.
     * @param {Request} request
     * @param {Env} env
     * @param {ExecutionContext} ctx
     * @returns {Promise<Response>}
     */
    export default {
      async fetch(request, env, ctx) {
        // Extract the target URL from the query string parameter 'url'
        const url = new URL(request.url);
        const targetUrlString = url.searchParams.get('url');

        // Validate the presence of the 'url' parameter
UrlString) {
          return new Response('Missing required query parameter: url', { status: 400 });
        }

        // Validate the target URL format
        let targetUrl;
        try {
          targetUrl = new URL(targetUrlString);
        } catch (e) {
          return new Response('Invalid URL provided in parameter: url', { status: 400 });
        }

        // Determine the HTTP method from the original request
        const method = request.method;

        // Prepare headers for the outgoing request
        // Important: Modify or override headers here as needed
        const headers = new Headers(request.headers);

        // *** MODIFIKASI UTAMA UNTUK MEMAKSA FORMAT GAMBAR ***
        // Ganti header Accept untuk meminta JPEG
        headers.set('Accept', 'image/jpeg,image/jpg,image/png,image/webp,image/gif,*/*;q=0.8');

        // Optional: Remove headers that might cause issues or reveal proxy identity
        headers.delete('CF-Connecting-IP');
        headers.delete('X-Forwarded-For');
        headers.delete('X-Real-IP');
        headers.delete('X-Forwarded-Host');
        // Optionally remove Accept-Encoding to prevent compression issues (try if needed)
        // headers.delete('Accept-Encoding');

        // Prepare the body for the outgoing request (if applicable)
        let body = null;
        if (method !== 'GET' && method !== 'HEAD') {
          // Note: For large bodies, consider using ReadableStream directly for efficiency
          body = request.body;
        }

        // Create the new request object to send to the target server
        const newRequest = new Request(targetUrl.toString(), {
          method: method,
          headers: headers,
          body: body,
          redirect: 'follow', // Follow redirects by default
        });

        try {
          // Fetch the resource from the target server
          const response = await fetch(newRequest);

          // Prepare headers for the response back to the client
          const responseHeaders = new Headers(response.headers);

          // Optional: Ensure security headers are not forwarded
          // responseHeaders.delete('Set-Cookie'); // Uncomment if cookies cause issues

          // Return the response from the target server
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
          });
        } catch (err) {
          // Handle errors during the fetch operation
          console.error('Proxy Error:', err);
          return new Response(`Proxy error: ${err.message}`, { status: 502 });
        }
      },
    };
