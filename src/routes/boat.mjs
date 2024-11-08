import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import Boat from "../models/boat.mjs";
import {default as BoatView} from "../views/pages/boat.mjs";
import Layout from "../views/layout.mjs";
import notFoundController from "../controllers/notfound.mjs";

/**
 * Route handler for the boat page
 *
 * @param req
 * @param res
 */
export default async function boatRoute(req, res) {
    let boatId = req.params?.boatId;
    let boatData;
    try {
        boatData = Boat.getBoatWithImageAndAddressFromDb(boatId);
        if (!boatData.boatId) {
            return notFoundController(req, res);
        }
        boatData.images = JSON.parse(boatData.images);
    } catch (e) {
        console.error(e);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Server Error'); // 500 Internal Server Error
    }
    switch (req.method) { // /boats/:boatId
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
                const boatPagePath = path.resolve(`build/boats/${boatId}.html`);
                const boatPageFileStats = fsSync.statSync(boatPagePath);
                // Last-Modified: Specifies the last time the resource was modified on the server. The browser compares
                // this value with the current time to determine if the response is stale.
                res.writeHead(204,
                    {
                        'Content-Type': 'text/html; charset=UTF-8', 'Content-Length': boatPageFileStats.size,
                        'Last-Modified': boatPageFileStats.mtime
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
            if (acceptContentType?.includes("*/*") ||
                acceptContentType?.includes("text/html")) {
                try {
                    const boat = BoatView({
                        user: req?.session?.user,
                        boatData
                    });
                    const layout = Layout({
                            page: { title: 'Boat'}, // TODO: Change title ?
                            user: req?.session?.user
                        }, [boat]
                    );
                    await fs.writeFile(`build/boats/${boatId}.html`, layout, {encoding: 'utf8'});
                    let boatPage;
                    const boatPagePath = path.resolve(`build/boats/${boatId}.html`);
                    const boatPageFileStats = await fs.stat(boatPagePath);
                    boatPage = await fs.readFile(boatPagePath, { encoding: 'utf8' });
                    res.writeHead(200,
                        {
                            'Content-Type': 'text/html; charset=UTF-8','Content-Length': boatPageFileStats.size,
                            'Last-Modified': boatPageFileStats.mtime
                        }
                    );
                    return res.end(boatPage);
                } catch (e) {
                    console.error(e);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Server Error'); // 500 Internal Server Error
                }
            } else if (acceptContentType?.includes("application/*") ||
                acceptContentType?.includes("application/json")) {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
                return res.end(JSON.stringify(boatData));
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
                res.writeHead(406, {'Content-Type': 'text/plain; charset=utf-8'}); // (406 Not Acceptable)
                return res.end(`Not Acceptable`);
            }
        default:
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET'}); // 405 – Method Not Allowed
            return res.end();
    }
}