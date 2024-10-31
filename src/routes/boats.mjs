import fsSync from "node:fs";
import path from "node:path";
import Boat from "../models/boat.mjs";
import Database from "../models/database.mjs";
import Address from "../models/address.mjs";
import Image from "../models/image.mjs";
import Boats from "../views/pages/boats.mjs";
import Layout from "../views/layout.mjs";
import fs from "node:fs/promises";

/**
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
            // TODO: Add Error Checking (400) to query input parameters
            // /boats?location=Chicago%2C+IL&date=2024-09-27&boatType=motorboat
            let locationCity, locationState, boatType = req?.query?.boatType;
            if (req.query?.location) {
                const locationArray = req.query.location?.split(', ');
                locationCity = locationArray?.[0]?.trim() === '' ? undefined : locationArray?.[0]?.trim();
                locationState = locationArray?.[1]?.trim() === '' ? undefined : locationArray?.[1]?.trim();
            }
            if (boatType?.trim() === 'boatType') {
                boatType = 'All';
                req.query.boatType = 'All';
            }
            if (boatType && boatType?.trim() === 'All') {
                boatType = undefined;
            }
            let boatsData;
            try {
                boatsData = Boat.getBoatsWithImageAndAddressFromDb(locationState, locationCity, boatType);
            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server Error'); // 500 Internal Server Error
            }
            const acceptContentType = req?.headers['accept'];
            if (acceptContentType?.includes("*/*") ||
                acceptContentType?.includes("text/html")) {
                try {
                    // req.query.location = 'Boston, MA';
                    const boats = Boats({
                        searchValues: req.query,
                        boatsData
                    });
                    const layout = Layout({
                            page: { title: 'Boats'},
                            user: req?.session?.user
                        }, [boats]
                    );
                    await fs.writeFile('build/boats.html', layout, {encoding: 'utf8'});
                    let boatsPage;
                    const boatsPagePath = path.resolve('build/boats.html');
                    const boatsPageFileStats = await fs.stat(boatsPagePath);
                    boatsPage = await fs.readFile(boatsPagePath, { encoding: 'utf8' });
                    res.writeHead(200,
                        {
                            'Content-Type': 'text/html; charset=UTF-8','Content-Length': boatsPageFileStats.size,
                            'Last-Modified': boatsPageFileStats.mtime
                        }
                    );
                    res.end(boatsPage);
                } catch (e) {
                    console.error(e);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Server Error'); // 500 Internal Server Error
                }
            } else if (acceptContentType?.includes("application/*") ||
                acceptContentType?.includes("application/json")) {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
                res.end(JSON.stringify(boatsData));
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
            if (contentType?.includes("application/json") || contentType?.includes("application/x-www-form-urlencoded")) {
                // Validate input (ownerId and type)
                // Create Address
                const address = new Address(req.body?.state, req.body?.city, req.body?.country, req.body?.zipCode, req.body?.street);
                addressId = Database.insert(address);
                // Create Boat
                // req.body.pricePerHour = parseInt(req.body?.pricePerHour);
                const boat = new Boat(req.body?.ownerId, addressId, req.body?.type, req.body?.pricePerHour, req.body?.description); // FIXME: Remove
                // const boat = new Boat(req.session.user.id, addressId, req.body?.type, req.body?.pricePerHour, req.body?.description);
                boatId = Database.insert(boat);
            } else if (contentType?.includes("multipart/form-data")) { // Form with Images
                // Validate input (ownerId and type)
                // Create Address
                const address = new Address(req.body?.state, req.body?.city, req.body?.country, req.body?.zipCode, req.body?.street);
                addressId = Database.insert(address);
                // Create Boat
                const boat = new Boat(req.body?.ownerId, addressId, req.body?.type, req.body?.pricePerHour, req.body?.description);
                boatId = Database.insert(boat);
                // Create Image/s (linked to the boat)
                const image = new Image(boatId, req.body?.boatPhoto?.pathName, req.body?.boatPhoto?.name, req.body?.boatPhoto?.type, req.body?.boatPhoto?.size)
                const imageId = Database.insert(image);
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