import NotFound from "../views/pages/not-found.mjs";
import Layout from "../views/layout.mjs";
import fs from "node:fs/promises";
import path from "node:path";

export default async function notFoundController(req, res) {
    try {
        const notFound = NotFound();
        const layout = Layout({page: {title: 'Not Found'}}, [notFound]);
        await fs.writeFile('build/not-found.html', layout, {encoding: 'utf8'});
        let notFoundPage;
        const notFoundPagePath = path.resolve('build/not-found.html');
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