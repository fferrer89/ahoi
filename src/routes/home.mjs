import fsSync from "node:fs";
import fs from "node:fs/promises"; // Async
import path from "node:path";
import Layout from "../views/layout.mjs";
import Home from "../views/pages/home.mjs";
import StaticPageBuilder from "../static/static-pages-builder.mjs";

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
            return res.end();
        case 'HEAD':
            try {
                // homePageFileStats.mtime; // The timestamp (UTC) indicating the last time this file was modified.
                // homePageFileStats.size; // The size of the file in bytes. 1024000 bits = 1MB
                // homePageFileStats.birthtime; // The timestamp indicating the creation time of this file.
                // Last-Modified: Specifies the last time the resource was modified on the server. The browser compares
                // this value with the current time to determine if the response is stale.
                res.writeHead(204,
                    {
                        'Content-Type': 'text/html; charset=UTF-8', 'Content-Length': StaticPageBuilder?.homeFileStats?.size,
                        'Last-Modified': StaticPageBuilder?.homeFileStats?.mtime
                    }
                );
                return res.end();
            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Server Error');
            }
        case 'GET':
            const acceptContentType = req?.headers['accept'];
            if (acceptContentType?.includes( "*/*") || acceptContentType?.includes("text/*") ||
                acceptContentType?.includes("text/html")) {
                try {
                    let homePage;
                    if (req?.session?.id) {
                        // If user is authenticated, return the dynamic home page
                        const home = Home();
                        const layout = Layout({
                                page: { title: 'Home'},
                                user: req?.session?.user
                            }, [home]
                        );
                        await fs.writeFile('build/index.html', layout, {encoding: 'utf8'});
                        // FIXME: Last-Modified (loginPageFileStats.mtime) should be the time in which the session was created (createdAt) ??
                        const homePagePath = path.resolve('build/index.html');
                        homePage = await fs.readFile(homePagePath, { encoding: 'utf8' });
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8'});
                        return res.end(homePage);
                    } else {
                        // If user is authenticated, return the static home page
                        const homePagePath = path.resolve('src/static/index.html');
                        homePage = await fs.readFile(homePagePath, { encoding: 'utf8' });
                        res.writeHead(200,
                            {
                                'Content-Type': 'text/html; charset=UTF-8', 'Last-Modified': StaticPageBuilder?.homeFileStats?.mtime
                            }
                        );
                        return res.end(homePage);
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
            return res.end();
    }
}