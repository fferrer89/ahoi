import Visitor from "../models/visitor.mjs";
// import {AsyncLocalStorage} from "async_hooks";
// const asyncLocalStorage = new AsyncLocalStorage();
/**
 * Visitor Session middleware: Tracks user's interactions with the website without requiring the user to log in.
 *
 * Data Stored: Typically includes:
 *  - Unique session ID
 *  - Timestamp of session start
 *  - User agent information (browser, device)
 *  - Page views
 *  - Shopping cart items (if applicable)
 *
 * Use Cases:
 *  - Analytics and tracking user behavior
 *  - Personalizing content based on browsing history
 *  - Providing a more seamless experience, even for non-logged-in users
 *
 * expireSessionCookieSec of 86_400 seconds === 1 day
 * web-visits (web-visitor) vs auth-session (auth-session)
 *
 */
export default function visitor(req, res) {
    console.info('-visitorMiddleware');
    const visitorCookieName= 'visitorId';
    const expireVisitorCookieSec = (365 * 24 * 60 * 60 * 10); // Time stored as UTC timestamp, so Max-Age=(365 * 24 * 60 * 60 * 10) seconds is UTC time now + 10 years
    const sameSitePolicyVisitorCookie = 'Strict';
    let visitor;
    let visitorCookieVal = req.cookies[visitorCookieName];
    if (visitorCookieVal) {
        visitorCookieVal = parseInt(visitorCookieVal);
        visitor = Visitor.getVisitorFromDb(visitorCookieVal);
        if (visitor && !Visitor.isExpiredVisitorDb(visitor.createdAt, visitor.expireTime)) {
            // There is a flesh visitor cookie and it is in the db flesh as well
            req.visitor = {id: visitor.id};
            return;
        }
    }
    visitor = new Visitor(expireVisitorCookieSec, true); // In-memory session store
    // The maximum age for cookies in Google Chrome is 400 days (13 months) from the time the cookie was set
    res.setHeader('Set-Cookie', `${visitorCookieName}=${visitor.id}; Max-Age=${expireVisitorCookieSec}; SameSite=${sameSitePolicyVisitorCookie}; HttpOnly; Secure`);
    // Set two cookies:
    // res.setHeader('Set-Cookie', [`${visitorCookieName}=${visitorCookieName.id}; Max-Age=${expireVisitorCookieSec}; SameSite=${sameSitePolicyVisitorCookie}; HttpOnly; Secure`, `ahoiPrefColor=White; SameSite=${sameSitePolicyVisitorCookie}; HttpOnly; Secure`]);
    req.visitor = {id: visitor.id};
    console.log(`req.visitor:  ${JSON.stringify(req.visitor)}`);
    // await asyncLocalStorage.enterWith(req.session); // TODO: See if i keep or remove this
}