import url from 'node:url';
import homeRoute from "./home.mjs";
import aboutRoute from "./about.mjs";
import Layout from "../views/layout.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import NotFound from "../views/pages/not-found.mjs";

/**
 * Route handling based on the pathname
 *
 * @param req
 * @param res
 */
export default async function routes(req, res) {
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