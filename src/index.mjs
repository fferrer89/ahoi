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
import Session from "./models/Session.mjs";

const asyncLocalStorage = new AsyncLocalStorage();
const HOSTNAME = process.env.HOSTNAME ? process.env.HOSTNAME : 'localhost';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;


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
        ahoiSession = await Session.getSessionFromDb(ahoiSessionCookie.value);
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

// Route handler for the home page
function homeRoute(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Welcome to my Node.js web server!');
}
// Route handler for the about page
function aboutRoute(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('This is the about page.');
}

/**
 * Route handling based on the pathname
 *
 * @param req
 * @param res
 */
function routes(req, res) {
    console.info('-routes');
    console.log('asyncLocalStorage.getStore()');
    console.log(asyncLocalStorage.getStore());
    // Parse the URL to extract the pathname
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    console.log(`pathname: ${pathname}`);
    switch (pathname) {
        case '/':
            homeRoute(req, res);
            break;
        case '/about':
            aboutRoute(req, res);
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
    }
}

// Create the HTTP server
const server = http.createServer();
server.on('request', async (req, res) => {
    // When an HTTP request hits the server, this node application will call the functions below.

    // Apply logger middleware
    loggerMiddleware(req, res, async () => {
        // Apply session middleware
        await sessionMiddleware(req, res, async () => {
            // Apply router
            routes(req, res);
        });
    });
});

// Activates this server, listening on a specific hostname/domain and port number
server.listen(PORT, HOSTNAME, () => {
    // TODO: Change to Secure protocol using a Secure Socket Layer (SSL) -> HTTPS
    console.info(`Server is running on http://${HOSTNAME}:${PORT}`);
});
