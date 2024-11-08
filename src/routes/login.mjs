import fs from "node:fs/promises";
import path from "node:path";
import Layout from "../views/layout.mjs";
import Login from "../views/pages/login.mjs";
import inputValidations from "../utils/input-validations.mjs";
import User from "../models/user.mjs";
import Session from "../models/session.mjs";
import logoutController from "../controllers/logout.mjs";
import StaticPagesBuilder from "../static/static-pages-builder.mjs";

/**
 * Route handler for the login page
 * @param req
 * @param res
 */
export default async function loginRoute(req, res) {
    //TODO: Implement reset-password functionality ("Trouble signing in?")
    switch (req.method) {
        case 'OPTIONS':
            res.writeHead(204, {'Allow': 'OPTIONS, HEAD, GET, POST'}); // 204 – No Content
            return res.end();
        case 'HEAD':
            res.writeHead(204, { 'Content-Type': 'text/plain', 'Content-Language': 'en-us'});
            return res.end();
        case 'GET':
            const acceptContentType = req?.headers['accept'];
            if (acceptContentType?.includes( "*/*") || acceptContentType?.includes("text/*") ||
                acceptContentType?.includes("text/html")) {
                /**
                 * TODO: Implement server-cache logic.
                 * Check the 'if-modified-since' request header that is sent by the browser automatically in each request.
                 * ('if-modified-since': 'Thu Nov 07 2024 17:39:20 GMT-0600 (Central Standard Time)')
                 * - Send a 304 (Not Modified) response without a body if following condition is true:
                 * req?.headers['if-modified-since'] >= StaticPagesBuilder?.loginFileStats?.mtime
                 * - Otherwise, send the full response if:
                 * req?.headers['if-modified-since'] < StaticPagesBuilder?.loginFileStats?.mtime
                 *
                 * @see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests
                 */
                try {
                    // If user is logged in with a session, log out
                    logoutController(req, res);
                    let loginPage;
                    const loginPagePath = path.resolve('src/static/login.html');
                    loginPage = await fs.readFile(loginPagePath, { encoding: 'utf8' });
                    res.writeHead(200,
                        {
                            'Content-Type': 'text/html; charset=UTF-8', 'Last-Modified': StaticPagesBuilder?.loginFileStats?.mtime
                        }
                    );
                    return res.end(loginPage);
                } catch (e) {
                    console.error(e);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Server Error'); // 500 Internal Server Error
                }
            } else {
                res.writeHead(406, { 'Content-Type': 'text/plain' }); // 406 Not Acceptable
                return res.end('Only \'text/html\' content type supported.');
            }
        case 'POST':
            const contentType = req.headers['content-type'];
            const acceptContentTypePost = req?.headers['accept'];
            let user;
            let props = {
                errorMessages: {},
                values: {
                    email: req.body?.email
                }
            }
            if (contentType?.includes("application/json") || contentType?.includes("application/x-www-form-urlencoded")) {
                try {
                    req.body.email = inputValidations.email('Email', req.body?.email);
                    props.values.email = req.body.email
                } catch (e) {
                    props.errorMessages.email = e.message;
                }
                try {
                    req.body.password = inputValidations.password('Password', req.body?.password);
                } catch (e) {
                    props.errorMessages.password = e.message;
                }
                // Query user db email and password
                user =  User.getLoginUserFromDb(req.body.email, req.body.password);

                if (!user && Object.keys(props.errorMessages).length === 0) {
                    props.errorMessages.generalErrorMsg = 'Incorrect credentials provided.';
                }
                if (Object.keys(props.errorMessages).length > 0) {
                    const login = Login(props);
                    const layout = Layout({
                            page: { title: 'Signup'},
                            user: req?.session?.user
                        }, [login]
                    );
                    await fs.writeFile('build/signup.html', layout, {encoding: 'utf8'});
                    let loginPage;
                    const loginPagePath = path.resolve('build/signup.html');
                    const loginPageFileStats = await fs.stat(loginPagePath);
                    loginPage = await fs.readFile(loginPagePath, {encoding: 'utf8'});
                    // FIXME: loginPageFileStats.mtime should be the last time the user record was modified
                    res.writeHead(400,
                        {
                            'Content-Type': 'text/html; charset=UTF-8', 'Content-Length': loginPageFileStats.size,
                            'Last-Modified': loginPageFileStats.mtime
                        }
                    );
                    // Return a 400 bad request response with the body containing the signup page with the <output> error messages
                    return res.end(loginPage);
                }
            } else {
                res.writeHead(415, {'Accept-Post': ['application/json; charset=utf-8', 'application/x-www-form-urlencoded']});
                return res.end(); // 415 Unsupported Media Type
            }
            const sessionCookieName= 'sessionId';
            const expireSessionCookieSec = 3600; // Time stored as UTC timestamp, so Max-Age=3600 is UTC time now + 1 hour
            const sameSitePolicySessionCookie = 'Strict';
            const session = new Session(req.visitor.id, user.id, expireSessionCookieSec, true);
            res.setHeader('Set-Cookie', `${sessionCookieName}=${session.id}; Max-Age=${expireSessionCookieSec}; SameSite=${sameSitePolicySessionCookie}; HttpOnly; Secure`);
            req.session = {
                id: session.id, visitorId: session.visitorId, createdAt: session.createdAt, expireTime: session.expireTime,
                user: {
                    id: user.id, username: user.username, userType: user.userType
                }
            };
            console.log(`req.session (login):  ${JSON.stringify(req.session)}`);

            // Handle Response
            // Content Negotiation (what body response type does the client want back?)
            if (acceptContentTypePost?.includes("text/html")) {
                res.writeHead(303, {'Content-Type': 'text/html', 'Location': '/'});
                return res.end(); // See Other (login page or user dashboard page)
            } else {
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
                res.writeHead(406, {'Accept': 'text/html; charset=utf-8'});
                return res.end(`Responses to this route are only supplied in text/html format`); // Not Acceptable
            }
        default:
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET, POST'}); // 405 – Method Not Allowed
            return res.end('Method Not Allowed');
    }
}