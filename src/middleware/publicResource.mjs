import url from 'node:url'; // The node:url module provides utilities for URL resolution and parsing.
import path from 'node:path';
import fs from "node:fs";
import {fileExtensionToMIMEType} from "../utils/helpers.mjs"; // The node:path module provides utilities for working with file and directory paths

// https://localhost:3000/public/styles/index.css
export default function publicResource(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    // https://localhost:3000/favicon.ico
    if (pathname.startsWith('/public') || pathname.startsWith('/favicon') && req.method === 'GET') {
        console.info('-publicResourceMiddleware');
        // /public/styles/index.css -> /Users/kikoferrer/Documents/Apps/web-applications/ahoi/src/public/styles/index.css
        const publicResourceFullPath = path.join(process.env.PWD, req.url); // FIXME: process.env.PWD ?
        try {
            const publicResourceFileStats = fs.statSync(publicResourceFullPath); // can throw 'ENOENT' if file not found
            const fileExtension = path.extname(publicResourceFullPath);
            const mimeType = fileExtensionToMIMEType(fileExtension);
            const publicFile = fs.readFileSync(publicResourceFullPath);
            res.setHeader('Content-Length', publicResourceFileStats.size);
            res.setHeader('Last-Modified', publicResourceFileStats.mtime);
            res.setHeader('Content-Type', mimeType);
            res.statusCode = 200;
            res.end(publicFile);
        } catch (err) {
            // https://nodejs.org/api/errors.html
            if (err?.code === 'ENOENT') {
                // ENOENT (No such file or directory): Commonly raised by fs operations to indicate that a component of the specified pathname does not exist. No entity (file or directory) could be found by the given path.
                res.statusCode = 404;
                res.end();
            } else {
                res.statusCode = 500;
                res.end();
            }
        }
    }
}