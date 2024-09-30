import fs from "node:fs/promises";
import path from "node:path";
import Layout from "../views/layout.mjs";
import Login from "../views/pages/login.mjs";
import inputValidations from "../utils/input-validations.mjs";
import User from "../models/user.mjs";
import Session from "../models/session.mjs";

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
            res.end();
            break;
        case 'HEAD':
            res.writeHead(204, { 'Content-Type': 'text/plain', 'Content-Language': 'en-us'});
            res.end();
            break;
        case 'GET':
            const acceptContentType = req?.headers['accept'];
            if (acceptContentType?.includes( "*/*") || acceptContentType?.includes("text/*") ||
                acceptContentType?.includes("text/html")) {
                try {
                    const login = Login();
                    const layout = Layout({
                            page: { title: 'Login'},
                            user: req?.session?.user
                        }, [login]
                    );
                    await fs.writeFile('build/login.html', layout, {encoding: 'utf8'});
                    let loginPage;
                    const loginPagePath = path.resolve('build/login.html');
                    const loginPageFileStats = await fs.stat(loginPagePath);
                    loginPage = await fs.readFile(loginPagePath, { encoding: 'utf8' });
                    res.writeHead(200,
                        {
                            'Content-Type': 'text/html; charset=UTF-8','Content-Length': loginPageFileStats.size,
                            'Last-Modified': loginPageFileStats.mtime
                        }
                    );
                    res.end(loginPage);
                } catch (e) {
                    console.error(e);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Server Error'); // 500 Internal Server Error
                }
            } else {
                res.writeHead(406, { 'Content-Type': 'text/plain' }); // 406 Not Acceptable
                res.end('Only \'text/html\' content type supported.');
            }
            break;
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
                    res.writeHead(400,
                        {
                            'Content-Type': 'text/html; charset=UTF-8', 'Content-Length': loginPageFileStats.size,
                            'Last-Modified': loginPageFileStats.mtime
                        }
                    );
                    // Return a 400 bad request response with the body containing the signup page with the <output> error messages
                    res.end(loginPage);
                    return;
                }
            } else {
                res.writeHead(415, {'Accept-Post': ['application/json; charset=utf-8', 'application/x-www-form-urlencoded']});
                res.end(); // 415 Unsupported Media Type
                return;
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
                res.end(); // See Other (login page or user dashboard page)
                return;
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
                res.end(`Responses to this route are only supplied in text/html format`); // Not Acceptable
            }
            break;
        default:
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET, POST'}); // 405 – Method Not Allowed
            res.end('Method Not Allowed');
    }
}