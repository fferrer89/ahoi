import fs from "node:fs/promises";
import path from "node:path";
import StaticPagesBuilder from "../static/static-pages-builder.mjs";

export default async function notFoundController(req, res) {
    try {
        let notFoundPage;
        const notFoundPagePath = path.resolve('src/static/notfound.html');
        notFoundPage = await fs.readFile(notFoundPagePath, {encoding: 'utf8'});
        res.writeHead(404,
            {
                'Content-Type': 'text/html; charset=UTF-8',
                'Last-Modified': StaticPagesBuilder?.notFoundFileStats?.mtime
            }
        );
        return res.end(notFoundPage);
    } catch (e) {
        console.error(e);
        res.writeHead(500, {'Content-Type': 'text/plain'});
        return res.end('Server Error'); // 500 Internal Server Error
    }
}