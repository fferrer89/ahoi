import fsSync from "node:fs";
import path from "node:path";
import Boat from "../models/boat.mjs";
import Database from "../models/database.mjs";

/**
 * TODO: Implement this
 * Route handler for the home page
 *
 * @param req
 * @param res
 */
export default async function boatsRoute(req, res) {
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
                const boatsPagePath = path.resolve('build/boats.html');
                const boatsPageFileStats = fsSync.statSync(boatsPagePath);
                // homePageFileStats.mtime; // The timestamp (UTC) indicating the last time this file was modified.
                // homePageFileStats.size; // The size of the file in bytes. 1024000 bits = 1MB
                // homePageFileStats.birthtime; // The timestamp indicating the creation time of this file.
                // Last-Modified: Specifies the last time the resource was modified on the server. The browser compares
                // this value with the current time to determine if the response is stale.
                res.writeHead(204,
                    {
                        'Content-Type': 'text/html; charset=UTF-8', 'Content-Length': boatsPageFileStats.size,
                        'Last-Modified': boatsPageFileStats.mtime
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
            // TODO: Implement this route
            // /boats?location=Chicago%2C+IL&date=2024-09-27&boatType=motorboat

            res.writeHead(200, { 'Content-Type': 'text/plain' }); // 406 Not Acceptable
            res.end('Only \'text/html\' content type supported.');

            break;
        case 'POST':
            const contentType = req.headers['content-type'];
            const acceptContentTypePost = req?.headers['accept'];
            // Handle Request
            let boatId;
            if (contentType?.includes("application/json") || contentType?.includes("application/x-www-form-urlencoded")) {
                // Validate input (ownerId and type)
                const boat = new Boat(req.body?.ownerId, req.body?.type);
                boatId = Database.insert(boat);
            } else if (contentType?.includes("application/form-data")) {

            } else {
                res.writeHead(415, {'Accept-Post': ['application/json; charset=utf-8', 'application/x-www-form-urlencoded']});
                res.end(); // 415 Unsupported Media Type
                return;
            }
            // Handle Response
            // Content Negotiation (what body response type does the client want back?)
            if (acceptContentTypePost?.includes("*/*") ||
                acceptContentTypePost?.includes("application/*") ||
                acceptContentTypePost?.includes("application/json")) {
                // Default response body type globally and for 'application/' types
                res.writeHead(201, {'Content-Type': 'application/json; charset=UTF-8'});
                const boatObj = JSON.stringify({boatId: boatId});
                res.end(boatObj);
            } else if (acceptContentTypePost?.includes("text/html")) {
                const bodyString  = JSON.stringify(req.body)
                res.writeHead(201, {'Content-Type': 'text/html'});
                const boatHTML = `
                    <dl>
                        <dt>boatId</dt>
                        <dd>${boatId}</dd>
                    </dl>`;
                res.end(boatHTML);
            } else {
                // Default response body type if the request doesn't contain an 'accept' header or an accept content type is not implemented
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
                res.writeHead(201, {'Content-Type': 'text/plain; charset=utf-8'});
                res.end(`boatId: ${boatId}`);
            }
            break;
        default:
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET'}); // 405 – Method Not Allowed
            res.end();
    }
}