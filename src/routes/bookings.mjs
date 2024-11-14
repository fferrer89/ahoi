import path from "node:path";
import fsSync from "node:fs";
import Booking from "../models/booking.mjs";
import Layout from "../views/layout.mjs";
import fs from "node:fs/promises";
import {default as BookingsView}  from "../views/pages/bookings.mjs";

export default async function bookingsRoute(req, res) {
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
                const bookingsPagePath = path.resolve('build/bookings.html');
                const bookingsPageFileStats = fsSync.statSync(bookingsPagePath);
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
            let userId = req?.session?.user?.id;
            if (!userId) {
                res.writeHead(401, { 'Content-Type': 'text/plain' });
                return res.end('User must be authenticated to access this Page'); // 401 Unauthorized
            }
            let bookings;
            try {
                // Get the user bookings
                bookings = Booking.getBookingsWithOwnerAndBoatFromDb(userId);
            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Server Error from querying the bookings'); // 500 Internal Server Error
            }
            const acceptContentType = req?.headers['accept'];
            if (acceptContentType?.includes("*/*") ||
                acceptContentType?.includes("text/html")) {
                try {
                    const bookingsPage = BookingsView({
                        bookings,
                    });
                    const layout = Layout({
                            page: { title: 'Your Bookings'},
                            user: req?.session?.user
                        }, [bookingsPage]
                    );
                    await fs.writeFile('build/bookings.html', layout, {encoding: 'utf8'});
                    let boatsPage;
                    const boatsPagePath = path.resolve('build/bookings.html');
                    const boatsPageFileStats = await fs.stat(boatsPagePath);
                    boatsPage = await fs.readFile(boatsPagePath, { encoding: 'utf8' });
                    res.writeHead(200,
                        {
                            'Content-Type': 'text/html; charset=UTF-8','Content-Length': boatsPageFileStats.size,
                            'Last-Modified': boatsPageFileStats.mtime
                        }
                    );
                    return res.end(boatsPage);
                } catch (e) {
                    console.error(e);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Server Error'); // 500 Internal Server Error
                }
            }
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET, POST'}); // 405 – Method Not Allowed
            return res.end();
        default:
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET, POST'}); // 405 – Method Not Allowed
            return res.end();
    }
}