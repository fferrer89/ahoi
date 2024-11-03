const ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
/**
 * Sets the response headers that are common across all the responses. A response header set here can be overriden
 * by the next middlewares, routes, route handlers, and/or controllers.
 */
export default function responseHeaders(req, res) {
    console.info('-responseHeadersMiddleware');
    res.setHeader('Server', 'Node.js'); // res.writeHead(204, {'Server': 'Apache'}); in later code overrides this
    res.setHeader('Content-Language', 'en-us');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // TODO: Include global CORS Preflight request policy headers (for OPTIONS header request only - req.method) if
    // needed below (Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers, ...)

    // Caching is different between development and staging/production environments
    if (ENV === 'development') {
        // Development and testing envs no cache to assist with testing and debugging
        /*
        Last-Modified: Specifies the last time the resource was modified on the server. The browser compares this value
         with the current time to determine if the response is stale. If Last-Modified is present and neither
         Cache-Control nor Expires are present, the browser calculates the difference between the current time and the
         Last-Modified value to determine freshness.

        private: This response directive indicates that the response can be stored only in a private cache (e.g. local
         caches in browsers).
        no-cache: This response directive indicates that the response can be stored in caches, but the response must be
         validated with the origin server before each reuse, even when the cache is disconnected from the origin
         server. This directive must be used if you want caches to always check for content updates while reusing
         stored content. It does this by requiring caches to revalidate each request with the origin server.
        no-store: This response directive indicates that the response must not be cached. Indicates that any caches of
         any kind (private or shared) should not store this response.
         */
        res.setHeader('Cache-Control', 'private; no-cache');
    } else {
        // Production and staging envs with cache to improve speed
        /*
        Flesh response: the response can be reused for subsequent requests, depending on request directives.
        Revalidate response: Ask the origin server whether or not the stored response is still fresh. Usually, the
        revalidation is done through a conditional request.
        max-age=604800: the response remains fresh until 604,800 seconds (7 days) after the response is generated. This
         directive specifies the maximum age in seconds that a response can be considered fresh.
        must-revalidate: This response directive indicates that the response can be stored in caches and can be reused
         while fresh. If the response becomes stale, it must be validated with the origin server before
         reuse. Typically, must-revalidate is used with the max-age response directive.
         */
        res.setHeader('Cache-Control', 'private; max-age=604800, must-revalidate');
    }
}