import path from "node:path";
import fsSync from "node:fs";
import {ACCOUNT_TYPES} from "../utils/constants.mjs";
import Database from "../models/database.mjs";
import Booking from "../models/booking.mjs";
import { convertDateFormat } from "../utils/helpers.mjs";
import Boat from "../models/boat.mjs";
import notFoundController from "../controllers/notfound.mjs";

export default async function boatBookingsRoute(req, res) {
    let boatId = req.params?.boatId;
    let boatData;
    try {
        boatData = Boat.getBoatFromDb(boatId);
        if (!boatData.id) {
            return notFoundController(req, res);
        }
    } catch (e) {
        console.error(e);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Server Error from querying the boats'); // 500 Internal Server Error
    }
    switch (req.method) { // /boats/:boatId/bookings
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
                const bookingsPagePath = path.resolve('build/bookings.html');
                const bookingsPageFileStats = fsSync.statSync(bookingsPagePath);
                // homePageFileStats.mtime; // The timestamp (UTC) indicating the last time this file was modified.
                // homePageFileStats.size; // The size of the file in bytes. 1024000 bits = 1MB
                // homePageFileStats.birthtime; // The timestamp indicating the creation time of this file.
                // Last-Modified: Specifies the last time the resource was modified on the server. The browser compares
                // this value with the current time to determine if the response is stale.
                res.writeHead(204,
                    {
                        'Content-Type': 'text/html; charset=UTF-8', 'Content-Length': bookingsPageFileStats.size,
                        'Last-Modified': bookingsPageFileStats.mtime
                    }
                );
                return res.end();
            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Server Error');
            }
        case 'GET':
            // Get the boat bookings
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET, POST'}); // 405 – Method Not Allowed
            return res.end();
        case 'POST':
            //  Protected Resource only logged-in users that are boat renters can submit a booking request
            if (!req?.session?.user?.id) {
                res.writeHead(303, {'Content-Type': 'text/html', 'Location': '/login'});
                return res.end(); // See Other
            }
            if (req?.session?.user?.userType !== ACCOUNT_TYPES.BOAT_RENTER) {
                res.writeHead(303, {'Content-Type': 'text/html', 'Location': '/signup'});
                return res.end();
            }
            const contentType = req.headers['content-type'];
            const acceptContentTypePost = req?.headers['accept'];
            // Handle Request
            let checkIn, checkOut, bookingId;
            // TODO: Input validation checks (dates should be in the following format (2024-11-10T06:26)
            if (contentType?.includes("application/json") || contentType?.includes("application/x-www-form-urlencoded")) {
                // TODO: Validate that boat does not already have a booking between checkIn and checkOut
                // Create booking
                checkIn = convertDateFormat(req?.body?.checkIn);
                checkOut = convertDateFormat(req?.body?.checkOut);
                const booking = new Booking(req?.session?.user?.id, boatId, checkIn, checkOut);
                bookingId = Database.insert(booking);
            } else {
                res.writeHead(415, {'Accept-Post': ['application/json; charset=utf-8', 'application/x-www-form-urlencoded', 'multipart/form-data']});
                return res.end(); // 415 Unsupported Media Type
            }
            // Content Negotiation (what body response type does the client want back?)
            if (acceptContentTypePost?.includes("*/*") ||
                acceptContentTypePost?.includes("text/*") ||
                acceptContentTypePost?.includes("text/html")) {
                // Default response body type globally and for 'html' types
                res.writeHead(201, { 'Content-Type': 'text/plain; charset=UTF-8' }); // FIXME: text/html
                // TODO: Redirect to bookings page
                return res.end(`bookingId: ${bookingId}`);
            } else if (acceptContentTypePost?.includes("application/*") ||
                acceptContentTypePost?.includes("application/json")) {
                res.writeHead(201, {'Content-Type': 'application/json; charset=UTF-8'});
                // TODO: Redirect to bookings page
                return res.end(JSON.stringify({bookingId}));
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
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET, POST'}); // 405 – Method Not Allowed
            return res.end();
    }
}