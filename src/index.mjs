// import https from 'node:https';
import http from 'node:http'; // TODO: delete
import path from "node:path";
import routes from "./routes/index.mjs";
import middlewares from "./middleware/index.mjs";
import errorHandling from "./middleware/errorHandling.mjs";
// import sslCredentials from "../config/ssl-certificate.mjs";


/**
 * Entry point of the application, which initializes and runs the SERVER.
 *
 * src/: This directory contains the "source code of your application", which refers to the JavaScript files that
 * contain the core logic and functionality of the Node.js application. These files are typically written in JavaScript
 * and include modules, routes, controllers, models, and other components.
 *
 * The src/ directory contains files with the application behavior and functionality. The other folders
 * (public/, config/, tests/, and seed.mjs) serve different purposes and aren't considered part of the core source code.
 */

// const COMM_PROTOCOL = 'https';
const COMM_PROTOCOL = 'http'; // TODO: delete
const HOSTNAME = process.env.HOSTNAME ? process.env.HOSTNAME : 'localhost';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
process.env.NODE_APP_ROOT_DIR = path.dirname(import.meta.dirname);
// console.log(process.env.NODE_APP_ROOT_DIR) // /Users/kikoferrer/Documents/Apps/web-applications/ahoi
// console.log('Print process.env: ');
// console.log(process.env);
/**
 * Create the HTTP server using the HTTP communication protocol with Secure Socket Layer (SSL) → HTTPS
 *
 * @see https://nodejs.org/api/https.html
 * @see https://mirzaleka.medium.com/a-detailed-look-into-the-node-js-http-module-680eb5e4548a
 * @type {Server<typeof IncomingMessage, typeof ServerResponse>}
 */
// const server = https.createServer(sslCredentials);
const server = http.createServer(); // TODO: delete
server.on('request', async (req, res) => {
    // When an HTTP request hits the server, this node application will call the functions below.
    req.on('error', err => {
        errorHandling(err, res, req);
    });
    const body = [];
    req.on('data', chunk => {
        body.push(chunk.toString('binary'));
    })
    req.on('end', () => {
        // At this point, we have the headers, method, url, and body (if present).
        res.on('error', err => {
            errorHandling(err, res, req);
        });
        req.body = body;
        try {
            middlewares(req, res);
            !res.writableEnded && routes(req, res);
        } catch (err) {
            errorHandling(err, req, res)
        }
    })
});

// Activates this server, listening on a specific hostname/domain and port number
server.listen(PORT, HOSTNAME, () => {
    console.info(`Server is running on ${COMM_PROTOCOL}://${HOSTNAME}:${PORT}`);
});
