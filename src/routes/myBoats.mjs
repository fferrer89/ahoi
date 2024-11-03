import fsSync from "node:fs";
import path from "node:path";
import Boat from "../models/boat.mjs";
import Database from "../models/database.mjs";
import Address from "../models/address.mjs";
import Image from "../models/image.mjs";
import MyBoats from "../views/pages/my-boats.mjs";
import Layout from "../views/layout.mjs";
import fs from "node:fs/promises";

/**
 * Route handler for the home page
 *
 * @param req
 * @param res
 */
export default async function myBoatsRoute(req, res) {
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
                    'Allow': 'OPTIONS, HEAD, GET, POST',
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
                const boatsPagePath = path.resolve('build/my-boats.html');
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
            // TODO: Protected resource. Only authenticated boat owners can access this route and can only see their own boats
            // console.log(req?.session?.user?.id);
            // console.log(req?.session?.user?.userType);
            // let ownerId = req?.session?.user?.id; // FIXME: Uncomment
            let ownerId = 1; // FIXME: Delete
            let myBoatsData;
            try {
                myBoatsData = Boat.getBoatsWithImageAndAddressFromDb(null, null, null, ownerId);
            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server Error'); // 500 Internal Server Error
            }
            const acceptContentType = req?.headers['accept'];
            if (acceptContentType?.includes("*/*") ||
                acceptContentType?.includes("text/html")) {
                try {
                    const myBoats = MyBoats({
                        myBoatsData
                    });
                    const layout = Layout({
                            page: { title: 'Boats'},
                        }, [myBoats]
                    );
                    await fs.writeFile('build/my-boats.html', layout, {encoding: 'utf8'});
                    let myBoatsPage;
                    const myBoatsPagePath = path.resolve('build/my-boats.html');
                    const myBoatsPageFileStats = await fs.stat(myBoatsPagePath);
                    myBoatsPage = await fs.readFile(myBoatsPagePath, { encoding: 'utf8' });
                    res.writeHead(200,
                        {
                            'Content-Type': 'text/html; charset=UTF-8','Content-Length': myBoatsPageFileStats.size,
                            'Last-Modified': myBoatsPageFileStats.mtime
                        }
                    );
                    res.end(myBoatsPage);
                } catch (e) {
                    console.error(e);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Server Error'); // 500 Internal Server Error
                }
            } else if (acceptContentType?.includes("application/*") ||
                acceptContentType?.includes("application/json")) {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
                res.end(JSON.stringify(myBoatsData));
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
                res.end(`Not Acceptable`);
            }
            break;
        case 'POST':
            // FIXME: PROTECTED RESOURCE. Only logged in users (req.session.user.id !== null) with a Boat Owner (req.session.user.id === ACCOUNT_TYPES.BOAT_OWNER) account can create boats.
            const contentType = req.headers['content-type'];
            const acceptContentTypePost = req?.headers['accept'];
            // Handle Request
            let boatId;
            let addressId;
            let imageId;
            if (contentType?.includes("application/json") || contentType?.includes("application/x-www-form-urlencoded")) {
                // Validate input (ownerId and type)
                // Create Address
                const address = new Address(req.body?.state, req.body?.city, req.body?.country ?? 'USA', req.body?.zipCode, req.body?.street);
                addressId = Database.insert(address);
                // Create Boat
                // req.body.pricePerHour = parseInt(req.body?.pricePerHour);
                const boat = new Boat(1, addressId, req.body?.type, req.body?.pricePerHour, req.body?.description); // FIXME: Remove
                // const boat = new Boat(req.session.user.id, addressId, req.body?.type, req.body?.pricePerHour, req.body?.description);
                boatId = Database.insert(boat);
            } else if (contentType?.includes("multipart/form-data")) { // Form with Images
                // Validate input (ownerId and type)
                // Create Address
                const address = new Address(req.body?.state, req.body?.city, req.body?.country ?? 'USA', req.body?.zipCode, req.body?.street);
                addressId = Database.insert(address);
                // Create Boat
                const boat = new Boat(req.body?.ownerId ?? 2, addressId, req.body?.type, req.body?.pricePerHour, req.body?.description);
                boatId = Database.insert(boat);
                // Create Image/s (linked to the boat)
                const image = new Image(boatId, req.body?.boatImage?.pathName, req.body?.boatImage?.name, req.body?.boatImage?.type, req.body?.boatImage?.size)
                imageId = Database.insert(image);
            } else {
                res.writeHead(415, {'Accept-Post': ['application/json; charset=utf-8', 'application/x-www-form-urlencoded', 'multipart/form-data']});
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
                const boatObj = JSON.stringify({
                    boatId: boatId,
                    type: req.body?.type,
                    pricePerHour: req.body?.pricePerHour,
                    description: req.body?.description,
                    imageId,
                    address: {
                        state: req.body?.state,
                        city: req.body?.city,
                        country: req.body?.country ?? 'USA',
                        zipCode: req.body?.zipCode,
                        street: req.body?.street,
                    },
                });
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
                // TODO: Redirect to boat page: /boats/:boatId
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
                res.end(`Not Acceptable`);
            }
            break;
        default:
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET, POST'}); // 405 – Method Not Allowed
            res.end();
    }
}