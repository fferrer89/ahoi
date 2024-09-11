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
// import crypto from 'node:crypto';
import { AsyncLocalStorage } from "async_hooks";
const asyncLocalStorage = new AsyncLocalStorage();
import Session from "./models/Session.mjs";
const session = new Session(); // Create an instance (new Session(3600000);)
const HOSTNAME = process.env.HOSTNAME ? process.env.HOSTNAME : 'localhost';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Logger middleware function
function loggerMiddleware(req, res, next) {
    console.info('-loggerMiddleware');
    const logMessage = `Request received: ${req.method} ${req.url}`;
    console.log(logMessage);
    next(); // Pass control to the next middleware or route
}
// Session middleware
async function sessionMiddleware(req, res, next) {
    const sessionName= 'ahoiSessionId';
    console.log('-sessionMiddleware');
    // Get Session
    const cookies = req?.headers['cookie']?.split(';')?.map(cookie => {
        const [name, value] = cookie?.split('=');
        return {name, value};
    });
    const ahoiSession = cookies?.find(cookie => cookie?.name === sessionName);
    let ahoiSessionId;
    if (ahoiSession) {
        // Get session info
        ahoiSessionId = await session.getSession(ahoiSession.value);
        if (!ahoiSessionId) {
            ahoiSessionId = await session.createSession();
        }
    } else {
        ahoiSessionId = await session.createSession(); // In-memory session store
        res.setHeader('Set-Cookie', `${sessionName}=${ahoiSessionId}`);
    }
    req.session = { sessionId: ahoiSessionId };
    console.log(`Existing ahoiSessionId: ${ahoiSessionId}`);
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
function routes(req, res) {
    // Parse the URL to extract the pathname
    console.log('asyncLocalStorage.getStore()');
    console.log(asyncLocalStorage.getStore());
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    console.log(`pathname: ${pathname}`);
    switch (pathname) {
        // Route handling based on the pathname
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

// console.log(process.env);
// Activates this server, listening on port 3000.
server.listen(PORT, HOSTNAME, () => {
    console.info(`Server is running on http://${HOSTNAME}:${PORT}`);
});
