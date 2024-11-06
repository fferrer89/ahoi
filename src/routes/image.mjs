import path from "node:path";
import fsSync from "node:fs";
import fs from "node:fs";
import Image from "../models/image.mjs";
import { fileExtensionToMIMEType } from "../utils/helpers.mjs";

/**
 * Route handler a specific image
 *
 * @param req
 * @param res
 */
export default async function imageRoute(req, res) {
    let imagePath, imageFullPath, imagePathFileStats, imageObj;
    try {
        imageObj = Image.getImageFromDb(req.params?.imageId);
        if (!imageObj) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('Image Not Found');
        }
        imagePath = path.resolve(`/uploads/images/${imageObj?.pathName}`);
        imageFullPath = path.join(process.env.NODE_APP_ROOT_DIR, imagePath); // /Users/kikoferrer/Documents/Apps/web-applications/ahoi/uploads/images/1730320042633-boat.png
        imagePathFileStats = fsSync.statSync(imageFullPath);
    } catch (err) {
        // console.error(err);
        // https://nodejs.org/api/errors.html
        if (err?.code === 'ENOENT') {
            // ENOENT (No such file or directory): Commonly raised by fs operations to indicate that a component of the specified pathname does not exist. No entity (file or directory) could be found by the given path.
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end();
        } else {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            return res.end('Server Error');
        }
    }
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
                    'Access-Control-Allow-Methods': 'OPTIONS, HEAD, GET',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Expose-Headers': 'Cache-Control ,Content-Type',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Max-Age': '86400'
                }
            ); // 204 – No Content
            return res.end();
        case 'HEAD':
            try {
                res.writeHead(204,
                    {
                        'Content-Type': 'text/html; charset=UTF-8', 'Content-Length': imagePathFileStats.size,
                        'Last-Modified': imagePathFileStats.mtime
                    }
                );
                return res.end();
            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Server Error');
            }
        case 'GET':
            try {
                const fileExtension = path.extname(imageFullPath);
                const mimeType = fileExtensionToMIMEType(fileExtension);
                const image = fs.readFileSync(imageFullPath);
                res.setHeader('Content-Length', imagePathFileStats.size);
                res.setHeader('Last-Modified', imagePathFileStats.mtime);
                res.setHeader('Content-Type', mimeType);
                res.statusCode = 200;
                return res.end(image);
            } catch (err) {
                // https://nodejs.org/api/errors.html
                if (err?.code === 'ENOENT') {
                    // ENOENT (No such file or directory): Commonly raised by fs operations to indicate that a component of the specified pathname does not exist. No entity (file or directory) could be found by the given path.
                    res.statusCode = 404;
                    return res.end('Image Not Found');
                } else {
                    res.statusCode = 500;
                    return res.end('Internal Server Error');
                }
            }
        default:
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET, POST'}); // 405 – Method Not Allowed
            return res.end();
    }
}