import Session from "../models/session.mjs";
import Database from "../models/database.mjs";
// import {AsyncLocalStorage} from "async_hooks";
// const asyncLocalStorage = new AsyncLocalStorage();
/**
 * Retrieves the Session Information if the request has the session cookie.
 *
 * Auth Sessions
 *  Purpose: Authenticating a user and maintaining their identity throughout their session.
 *  Data Stored: Typically includes:
 *   - Unique session ID
 *   - User ID or username
 *   - Authentication token
 *   - User roles or permissions
 *   - Timestamp of last activity
 *  Use Cases:
 *   - Allowing users to access restricted content or features
 *   - Personalizing content based on user preferences or account information
 *   - Providing a secure and personalized experience for logged-in users
 * web-visits (web-session) vs auth-session (auth-session)
 */
export default function session(req, res) {
    console.info('-sessionMiddleware');
    const sessionCookieName= 'sessionId';
    const expireSessionCookieSec = 3600; // Time stored as UTC timestamp, so Max-Age=3600 is UTC time now + 1 hour
    const sameSitePolicySessionCookie = 'Strict';
    let session;
    let sessionCookieVal = req.cookies[sessionCookieName];
    if (sessionCookieVal) {
        sessionCookieVal = parseInt(sessionCookieVal);
    }
    if (sessionCookieVal) {
        sessionCookieVal = parseInt(sessionCookieVal);
        session = Session.getSessionFromDb(sessionCookieVal);
        if (session || !Session.isExpiredSessionDb(session.createdAt, session.expireTime)) {
            if (session.visitorId !== req.visitor.id) {
                // Update the session to have the correct visitor
                session.visitorId = req.visitor.id;
                Database.updateAll(session);
            }
            req.session = {id: session.id, visitorId: session.visitorId, userId: session.userId};
            console.log(`req.session:  ${JSON.stringify(req.session)}`);
        }
    }
    // await asyncLocalStorage.enterWith(req.session); // TODO: See if i keep or remove this
}