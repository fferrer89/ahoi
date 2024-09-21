import fsSync from "node:fs";
import fs from "node:fs/promises"; // Async
import path from "node:path";
import Layout from "../views/layout.mjs";
import Home from "../views/pages/home.mjs";


/**
 * Route handler for the home page
 *
 * @param req
 * @param res
 */
export default async function homeRoute(req, res) {
    switch (req.method) {
        case 'OPTIONS':
            /*
            This method be used to test the allowed HTTP methods for a request or to determine whether a request would
            succeed when making a CORS preflighted request. A client can specify a URL with this method, or an asterisk
            (*) to refer to the entire server.
            In CORS, a preflight request is sent with the OPTIONS method so that the server can respond if it is
            acceptable to send the request.

            @see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS
            @see: https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
            */
            res.writeHead(204,
                {
                    'Allow': 'OPTIONS, HEAD, GET',
                    'Access-Control-Allow-Origin': 'https://foo.example',
                    'Access-Control-Allow-Methods': 'OPTIONS, HEAD, GET, POST',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Expose-Headers': 'Cache-Control ,Content-Type',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Max-Age': '86400'
                }
            ); // 204 – No Content
            res.end();
            break;
        case 'HEAD':
            try {
                const homePagePath = path.resolve('src/static/index.html');
                const homePageFileStats = fsSync.statSync(homePagePath);
                // homePageFileStats.mtime; // The timestamp (UTC) indicating the last time this file was modified.
                // homePageFileStats.size; // The size of the file in bytes. 1024000 bits = 1MB
                // homePageFileStats.birthtime; // The timestamp indicating the creation time of this file.
                // Last-Modified: Specifies the last time the resource was modified on the server. The browser compares
                // this value with the current time to determine if the response is stale.
                res.writeHead(204,
                    {
                        'Content-Type': 'text/html; charset=UTF-8', 'Content-Length': homePageFileStats.size,
                        'Last-Modified': homePageFileStats.mtime
                    }
                );
                res.end();
            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server Error');
            }
            break;
        case 'GET':
            const acceptContentType = req?.headers['accept'];
            if (acceptContentType.includes( "*/*") || acceptContentType.includes("text/*") || acceptContentType.includes("text/html")) {
                try {
                    const home = Home();
                    const layout = Layout({page: { title: 'Home'}}, [home]);
                    await fs.writeFile('build/index.html', layout, {encoding: 'utf8'});
                    let homePage;
                    const homePagePath = path.resolve('build/index.html');
                    const homePageFileStats = await fs.stat(homePagePath);
                    homePage = await fs.readFile(homePagePath, { encoding: 'utf8' });
                    res.writeHead(200,
                        {
                            'Content-Type': 'text/html; charset=UTF-8','Content-Length': homePageFileStats.size,
                            'Last-Modified': homePageFileStats.mtime
                        }
                    );
                    res.end(homePage);
                } catch (e) {
                    console.error(e);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Server Error'); // 500 Internal Server Error
                }
            } else {
                res.writeHead(406, { 'Content-Type': 'text/plain' }); // 406 Not Acceptable
                res.end('Only \'text/html\' content type supported.');
            }
            break;
        case 'POST':
            const reqContentType = req?.headers['Content-Type'];
            if (reqContentType === "*/*" || reqContentType?.startsWith("application/*") || reqContentType?.startsWith("application/json")) {
                // */*, application/*, or application/json
            } else {
                /*
                 MIME Type:
                 - Format: type/subtype;optionalParameter=value
                 - An optional parameter (optionalParameter) can be added to provide additional details.

                 e.g.:
                 application/json; charset=UTF-8
                 text/plain; charset=UTF-8
                 application/x-www-form-urlencoded // used in forms without files/img attached
                 multipart/form-data // used in forms with files/img attached
                 */
                res.writeHead(415, {'Accept-Post': 'application/json; charset=UTF-8'}); // application/json; charset=UTF-8, text/plain
                res.end(); // 415 Unsupported Media Type
            }
            break
        default:
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET'}); // 405 – Method Not Allowed
            res.end();
    }
}