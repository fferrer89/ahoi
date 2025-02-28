import logoutController from "../controllers/logout.mjs";

/**
 * Route handler for the login page
 * @param req
 * @param res
 */
export default async function logoutRoute(req, res) {
    switch (req.method) {
        case 'OPTIONS':
            res.writeHead(204, {'Allow': 'OPTIONS, HEAD, GET'}); // 204 – No Content
            return res.end();
        case 'HEAD':
            res.writeHead(204, { 'Content-Type': 'text/plain', 'Content-Language': 'en-us'});
            return res.end();
        case 'GET':
            const acceptContentType = req?.headers['accept'];
            if (acceptContentType?.includes( "*/*") || acceptContentType?.includes("text/*") ||
                acceptContentType?.includes("text/html")) {
                try {
                    if (logoutController(req, res)) {
                        // If user is authenticated or logged in (req.session.id) and the session is not expired, remove
                        // the session cookie and the session record and redirect to home page
                        res.writeHead(303, {'Content-Type': 'text/html', 'Location': '/'});
                        return res.end(); // See Other (login page or user dashboard page)
                    } else {
                        // If user is not authenticated/logged in, redirect to login route
                        res.writeHead(303, {'Content-Type': 'text/html', 'Location': '/login'});
                        return res.end(); // See Other (login page or user dashboard page)
                    }
                } catch (e) {
                    console.error(e);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Server Error'); // 500 Internal Server Error
                }
            } else {
                res.writeHead(406, { 'Content-Type': 'text/plain' }); // 406 Not Acceptable
                return res.end('Only \'text/html\' content type supported.');
            }
        default:
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET'}); // 405 – Method Not Allowed
            return res.end('Method Not Allowed');
    }
}