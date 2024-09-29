import fs from "node:fs/promises";
import path from "node:path";
import Layout from "../views/layout.mjs";
import Signup from "../views/pages/signup.mjs";
import Boat from "../models/boat.mjs";
import Database from "../models/database.mjs";
import User from "../models/user.mjs";
import inputValidations from "../utils/input-validations.mjs";

/**
 * Route handler for the signup page
 * @param req
 * @param res
 */
export default async function signupRoute(req, res) {
    switch (req.method) {
        case 'OPTIONS':
            res.writeHead(204, {'Allow': 'OPTIONS, HEAD, GET, POST'}); // 204 – No Content
            res.end();
            break;
        case 'HEAD':
            res.writeHead(204, {'Content-Type': 'text/plain', 'Content-Language': 'en-us'});
            res.end();
            break;
        case 'GET':
            const acceptContentType = req?.headers['accept'];
            if (acceptContentType?.includes("*/*") || acceptContentType?.includes("text/*") ||
                acceptContentType?.includes("text/html")) {
                try {
                    const signup = Signup();
                    const layout = Layout({page: {title: 'Signup'}}, [signup]);
                    await fs.writeFile('build/signup.html', layout, {encoding: 'utf8'});
                    let signupPage;
                    const signupPagePath = path.resolve('build/signup.html');
                    const signupPageFileStats = await fs.stat(signupPagePath);
                    signupPage = await fs.readFile(signupPagePath, {encoding: 'utf8'});
                    res.writeHead(200,
                        {
                            'Content-Type': 'text/html; charset=UTF-8', 'Content-Length': signupPageFileStats.size,
                            'Last-Modified': signupPageFileStats.mtime
                        }
                    );
                    res.end(signupPage);
                } catch (e) {
                    console.error(e);
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.end('Server Error'); // 500 Internal Server Error
                }
            } else {
                res.writeHead(406, {'Content-Type': 'text/plain'}); // 406 Not Acceptable
                res.end('Only \'text/html\' content type supported.');
            }
            break;
        case 'POST':
            // TODO: Implement verify email functionality and Implement reset-password functionality
            const contentType = req.headers['content-type'];
            const acceptContentTypePost = req?.headers['accept'];
            let userId;
            let props = {
                errorMessages: {},
                values: {
                    userType: req.body?.userType,
                    email: req.body?.email,
                    username: req.body?.username,
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
                    props.values.password = req.body.password
                } catch (e) {
                    props.errorMessages.password = e.message;
                }
                try {
                    req.body.userType = inputValidations.userType('Account Type', req.body?.userType);
                    props.values.userType = req.body.userType
                } catch (e) {
                    props.errorMessages.userType = e.message;
                }
                try {
                    req.body.username = inputValidations.string('Username', req.body?.username);
                    props.values.username = req.body.username;
                } catch (e) {
                    props.errorMessages.username = e.message;
                }
                const user = new User(req.body?.email, req.body?.password, req.body?.userType, req.body?.username);
                try {
                    userId = Database.insert(user);
                } catch (err) {
                    switch (err.errcode) {
                        case 275: // SQLITE: constraint failed
                            /*
                            err.errcode = 275
                            err.errstr = “constraint failed”
                            err.message = “CHECK constraint failed: LENGTH(TRIM(username)) > 0”
                            ---
                            err.errcode = 275
                            err.errstr = “constraint failed”
                            err.message = “CHECK constraint failed: email LIKE '%_@_%._%' AND
                                    LENGTH(email) - LENGTH(REPLACE(email, '@', '')) = 1 AND
                                    SUBSTR(LOWER(email), 1, INSTR(email, '.') - 1) NOT GLOB '*[^@0-9a-z]*' AND
                                    SUBSTR(LOWER(email), INSTR(email, '.') + 1) NOT GLOB '*[^a-z]*'”
                             ---

                            err.errcode = 275
                            err.errstr = “constraint failed”
                            err.message = “CHECK constraint failed: userType IN ('Boat Renter', 'Boat Owner', 'Admin’)”
                            ---
                            err.errcode = 275
                            err.errstr = “constraint failed”
                            err.message = “CHECK constraint failed: LENGTH(TRIM(password)) > 7 AND password GLOB '*[^0-9a-zA-Z]*' AND password GLOB '*[0-9]*' AND  password GLOB '*[a-zA-Z]*’”
                            ---
                             */
                            if (err.message?.includes("LENGTH(TRIM(username))")) {
                                props.errorMessages.username= `Username cannot be empty.`;
                            }
                            if (err.message?.includes("email LIKE")) {
                                props.errorMessages.email= `Please provide a properly formatted email address.`;
                            }
                            if (err.message?.includes("userType IN")) {
                                props.errorMessages.generalErrorMsg= `Please select a Boat Renter or a Boat Owner account type.`;
                            }
                            if (err.message?.includes("password")) {
                                props.errorMessages.password= `Passwords must be at least 10 characters long and should include at least one special character, one number, and one letter.`;
                            }
                            break;
                        case 1299:
                            /*
                            err.errcode = 1299,
                            err.errstr = “constraint failed”
                            err.message = “NOT NULL constraint failed: users.password”
                             */
                            if (err.message?.includes("NOT NULL constraint failed: users.username")) {
                                props.errorMessages.username= `Username cannot be empty.`;
                            }
                            if (err.message?.includes("NOT NULL constraint failed: users.username")) {
                                props.errorMessages.email= `Email cannot be empty.`;
                            }
                            if (err.message?.includes("NOT NULL constraint failed: users.userType")) {
                                props.errorMessages.generalErrorMsg= `Account type cannot be empty.`;
                            }
                            if (err.message?.includes("NOT NULL constraint failed: users.password")) {
                                props.errorMessages.password= `Password cannot be empty.`;
                            }
                            break;
                        case 2067:
                            /*
                            err.code: 'ERR_SQLITE_ERROR'
                            err.errcode: 2067
                            err.errstr: "constraint failed"
                            err.message: “UNIQUE constraint failed: users.email, users.userType”
                             */
                            if (err.message?.includes("users.email, users.userType")) {
                                props.errorMessages.email= `This email already has a ${req.body?.userType?.toLowerCase()} account associated with it.`;
                            }
                            break;
                        default:
                            res.writeHead(500);
                            res.end();
                            return;
                    }
                    if (Object.keys(props.errorMessages).length === 0) {
                        // TODO: implement this
                        res.writeHead(500);
                        res.end();
                        return;
                    }
                }
                if (Object.keys(props.errorMessages).length > 0) {
                    const signup = Signup(props);
                    const layout = Layout({page: {title: 'Signup'}}, [signup]);
                    await fs.writeFile('build/signup.html', layout, {encoding: 'utf8'});
                    let signupPage;
                    const signupPagePath = path.resolve('build/signup.html');
                    const signupPageFileStats = await fs.stat(signupPagePath);
                    signupPage = await fs.readFile(signupPagePath, {encoding: 'utf8'});
                    res.writeHead(400,
                        {
                            'Content-Type': 'text/html; charset=UTF-8', 'Content-Length': signupPageFileStats.size,
                            'Last-Modified': signupPageFileStats.mtime
                        }
                    );
                    // Return a 400 bad request response with the body containing the signup page with the <output> error messages
                    res.end(signupPage);
                    return;
                }
            } else {
                res.writeHead(415, {'Accept-Post': ['application/json; charset=utf-8', 'application/x-www-form-urlencoded']});
                res.end(); // 415 Unsupported Media Type
                return;
            }
            // Update the ahoiVisitorId record (cookie) by adding the userId property?
            // Create a new cookie for the new session (ahoiSessionId)

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