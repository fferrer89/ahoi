import url from 'node:url';
import homeRoute from "./home.mjs";
import aboutRoute from "./about.mjs";

/**
 * Route handling based on the pathname
 *
 * @param req
 * @param res
 */
export default function routes(req, res) {
    console.info('-routes');
    // Parse the URL to extract the pathname
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    console.log(`pathname: ${pathname}`);
    switch (pathname) {
        case '/':
            homeRoute(req, res);
            break;
        case '/about':
            aboutRoute(req, res);
            break;
        default:
            // notFound(req, res); // HTML page with not-found message
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' }); // 404 – Resource Not Found
            res.end('Not Found');
    }
}