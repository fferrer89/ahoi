import fs from "node:fs/promises";
import path from "node:path";
import homeRoute from "./home.mjs";
import aboutRoute from "./about.mjs";
import boatsRoute from "./boats.mjs";
import Layout from "../views/layout.mjs";
import NotFound from "../views/pages/not-found.mjs";

/**
 * Route handling based on the pathname
 *
 * @param req
 * @param res
 */
export default async function routes(req, res) {
    console.info('-routes');
    console.log(`pathname: ${req.pathname}`);

    // TODO: move below to own params middleware: paramsMiddleware() or retrieveParams() or requestHeaders()
    const urlParts = req.pathname.split('/'); // /boats/1234 -> [ '', 'boats', '1234' ]
    const boatsRegex = /^\/boats\/[0-9]+$/; // '/boats/1234567890', '/boats/9', '/boats/0', ...
    const usersRegex = /^\/users\/[0-9]+$/; // '/users/000567890', '/users/9', '/users/0', ...
    if (boatsRegex.test(req.pathname)) { // /boats/1234
        // console.log(urlParts);
        // console.log(`urlParts[1]: ${urlParts[2]}`); // urlParts[2] -> '1234'
        req.params = { boatId: urlParts[2] }
    } else if (usersRegex.test(req.pathname)) { // /boats/009860
        req.params = { userId: urlParts[2] } // userId[2] -> '009860'
    }
    // TODO: end todo

    switch (req.pathname) {
        case '/':
            homeRoute(req, res);
            break;
        case '/about':
            aboutRoute(req, res);
            break;
        case '/boats':
            boatsRoute(req, res);
            break;
        case `/boats/${req.params?.boatId}`: // FIXME: check whether '/boats/' takes this route and fix it if it does
            // boatRoute(req, res);
            res.writeHead(200);
            res.end(`/boats/${req.params.boatId}`);
            break;
        case '/users':
            break;
        case `/users/${req.params?.userId}`: // FIXME: check whether '/users/ ' takes this route and fix it if it does
            res.writeHead(200);
            res.end(`/users/${req.params.userId}`);
            break;
        default:
            // TODO: Mode this to a different place
            try {
                const notFound = NotFound();
                const layout = Layout({page: {title: 'Not Found'}}, [notFound]);
                await fs.writeFile('build/notfound.html', layout, {encoding: 'utf8'});
                let notFoundPage;
                const notFoundPagePath = path.resolve('build/notfound.html');
                const notFoundPageFileStats = await fs.stat(notFoundPagePath);
                notFoundPage = await fs.readFile(notFoundPagePath, {encoding: 'utf8'});
                res.writeHead(404,
                    {
                        'Content-Type': 'text/html; charset=UTF-8', 'Content-Length': notFoundPageFileStats.size,
                        'Last-Modified': notFoundPageFileStats.mtime
                    }
                );
                res.end(notFoundPage);
            } catch (e) {
                console.error(e);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Server Error'); // 500 Internal Server Error
            }
    }
}