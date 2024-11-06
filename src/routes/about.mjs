/**
 * Route handler for the about page
 * @param req
 * @param res
 */
export default function aboutRoute(req, res) {
    switch (req.method) {
        case 'OPTIONS':
            res.writeHead(204, {'Allow': 'OPTIONS, HEAD, GET'}); // 204 – No Content
            return res.end();
        case 'HEAD':
            res.writeHead(204, { 'Content-Type': 'text/plain', 'Content-Language': 'en-us'});
            return res.end();
        case 'GET':
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            return res.end('This is the about page.');
        default:
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET'}); // 405 – Method Not Allowed
            return res.end('Method Not Allowed');
    }
}