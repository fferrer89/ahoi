/**
 * Entry point of the application, which initializes and runs the server.
 *
 * src/: This directory contains the "source code of your application", which refers to the JavaScript files that
 * contain the core logic and functionality of the Node.js application. These files are typically written in JavaScript
 * and include modules, routes, controllers, models, and other components.
 *
 * The src/ directory contains files with the application behavior and functionality. The other folders
 * (public/, config/, tests/, and seed.mjs) serve different purposes and aren't considered part of the core source code.
 */

import http from 'node:http';
import url from 'node:url';
import { AsyncLocalStorage } from "async_hooks";
import Session from "./models/session.mjs";
import routes from "./routes/index.mjs";

const asyncLocalStorage = new AsyncLocalStorage();
const HOSTNAME = process.env.HOSTNAME ? process.env.HOSTNAME : 'localhost';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const ENV = process.env.ENV ? process.env.ENV : 'development';


/**
 * Logger middleware function
 *
 * @param req
 * @param res
 * @param next
 */
function loggerMiddleware(req, res, next) {
    console.info('-loggerMiddleware');
    const logMessage = `Request received: ${req.method} ${req.url}`;
    console.log(logMessage);
    next(); // Pass control to the next middleware or route
}

/**
 * Sets the response headers that are common across all the responses. A response header set here can be overriden
 * by the next middlewares, routes, route handlers, and/or controllers.
 *
 * @param req
 * @param res
 * @param next
 */
function responseHeadersMiddleware(req, res, next) {
    console.info('-loggerMiddleware');
    res.setHeader('Server', 'Node.js'); // res.writeHead(204, {'Server': 'Apache'}); in later code overrides this
    res.setHeader('Content-Language', 'en-us');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // TODO: Include global CORS Preflight request policy headers (for OPTIONS header request only - req.method) if
    // needed below (Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers, ...)

    // Caching is different between development and staging/production environments
    if (ENV === 'development') {
        // Development and testing envs no cache to assist with testing and debugging
        /*
        Last-Modified: Specifies the last time the resource was modified on the server. The browser compares this value
         with the current time to determine if the response is stale. If Last-Modified is present and neither
         Cache-Control nor Expires are present, the browser calculates the difference between the current time and the
         Last-Modified value to determine freshness.

        private: This response directive indicates that the response can be stored only in a private cache (e.g. local
         caches in browsers).
        no-cache: This response directive indicates that the response can be stored in caches, but the response must be
         validated with the origin server before each reuse, even when the cache is disconnected from the origin
         server. This directive must be used if you want caches to always check for content updates while reusing
         stored content. It does this by requiring caches to revalidate each request with the origin server.
        no-store: This response directive indicates that the response must not be cached. Indicates that any caches of
         any kind (private or shared) should not store this response.
         */
        res.setHeader('Cache-Control', 'private; no-cache');
    } else {
        // Production and staging envs with cache to improve speed
        /*
        Flesh response: the response can be reused for subsequent requests, depending on request directives.
        Revalidate response: Ask the origin server whether or not the stored response is still fresh. Usually, the
        revalidation is done through a conditional request.
        max-age=604800: the response remains fresh until 604,800 seconds (7 days) after the response is generated. This
         directive specifies the maximum age in seconds that a response can be considered fresh.
        must-revalidate: This response directive indicates that the response can be stored in caches and can be reused
         while fresh. If the response becomes stale, it must be validated with the origin server before
         reuse. Typically, must-revalidate is used with the max-age response directive.
         */
        res.setHeader('Cache-Control', 'private; max-age=604800, must-revalidate');
    }
    next(); // Pass control to the next middleware or route
}

/**
 * Session middleware
 *
 * expireSessionCookieSec of 86_400 seconds === 1 day
 *
 * @param req
 * @param res
 * @param next
 * @return {Promise<void>}
 */
async function sessionMiddleware(req, res, next) {
    console.info('-sessionMiddleware');
    const sessionName= 'ahoiSessionId';
    const expireSessionCookieSec = 3600; // Time stored as UTC timestamp, so Max-Age=3600 is UTC time now + 1 hour
    const sameSitePolicySessionCookie = 'Strict';
    const cookies = req?.headers['cookie']?.split(';')?.map(cookie => {
        const [name, value] = cookie?.split('=');
        return {name, value};
    });
    const ahoiSessionCookie = cookies?.find(cookie => cookie?.name === sessionName);
    console.log(ahoiSessionCookie);
    let ahoiSession;
    if (ahoiSessionCookie) {
        ahoiSession = Session.getSessionFromDb(ahoiSessionCookie.value);
        if (!ahoiSession || Session.isSessionDbExpired(ahoiSession.createdAt, ahoiSession.expireTime)) {
            ahoiSession = new Session(expireSessionCookieSec, true);
        }
    } else {
        ahoiSession = new Session(expireSessionCookieSec, true);// In-memory session store
        // res.setHeader('Set-Cookie', `${sessionName}=${ahoiSessionId}; Max-Age=${expireSecSessionCookie}; SameSite=${sameSitePolicySessionCookie}; HttpOnly; Secure`);
        res.setHeader('Set-Cookie', `${sessionName}=${ahoiSession.id}; Max-Age=${expireSessionCookieSec}; SameSite=${sameSitePolicySessionCookie}; HttpOnly`);
    }
    req.session = {id: ahoiSession.id, userId: ahoiSession.userId};
    console.log(req.session);
    await asyncLocalStorage.enterWith(req.session); // TODO: See if i keep this
    next();
}

// Define the error handling middleware function
function errorHandlingMiddleware(err, req, res) {
    console.error(err); // Log the error for debugging
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end(err.message);
}

// Create the HTTP server
const server = http.createServer();
server.on('request', async (req, res) => {
    // When an HTTP request hits the server, this node application will call the functions below.

    // Apply logger middleware
    loggerMiddleware(req, res, async () => {
        responseHeadersMiddleware(req, res, async () => {
            // Apply session middleware
            await sessionMiddleware(req, res, async () => {
                // Apply router
                try {
                    routes(req, res);
                } catch (err) {
                    errorHandlingMiddleware(err, req, res)
                }
            });
        })
    });
});

// Activates this server, listening on a specific hostname/domain and port number
server.listen(PORT, HOSTNAME, () => {
    // TODO: Change to Secure protocol using a Secure Socket Layer (SSL) -> HTTPS
    console.info(`Server is running on http://${HOSTNAME}:${PORT}`);
});
