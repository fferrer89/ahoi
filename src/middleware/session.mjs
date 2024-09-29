import Session from "../models/session.mjs";
import Database from "../models/database.mjs";
import User from "../models/user.mjs";
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
    const sameSitePolicySessionCookie = 'Strict';
    let session;
    let sessionCookieVal = req.cookies[sessionCookieName];
    if (!sessionCookieVal) {
        return;
    }
    sessionCookieVal = parseInt(sessionCookieVal);
    session = Session.getSessionFromDb(sessionCookieVal);
    if (!session) {
        res.setHeader('Set-Cookie', `${sessionCookieName}=delete; Max-Age=0; SameSite=${sameSitePolicySessionCookie}; HttpOnly; Secure`);
        return;
    }
    if (Session.isExpiredSessionDb(session.createdAt, session.expireTime)) {
        // There is a session, but it is expired (stale)
        res.setHeader('Set-Cookie', `${sessionCookieName}=${session.id}; Max-Age=0; SameSite=${sameSitePolicySessionCookie}; HttpOnly; Secure`);
        Database.delete(Session.db, Session.dbTableName, session.id);
        return;
    }
    // There is a session and it is not expired (flesh)
    if (session.visitorId !== req.visitor.id) {
        // Update the session to have the correct visitor
        session.visitorId = req.visitor.id;
        Database.updateAll(session);
    }
    // Find the related user
    const user = Database.query(User.db, User.dbTableName, session.userId);
    if (!user) {
        // If user cannot be found, delete the cookie and delete the session
        // Max-Age: A zero or negative number will expire the cookie immediately
        res.setHeader('Set-Cookie', `${sessionCookieName}=${session.id}; Max-Age=0; SameSite=${sameSitePolicySessionCookie}; HttpOnly; Secure`);
        Database.delete(Session.db, Session.dbTableName, session.id);
    }
    req.session = {
        id: session.id, visitorId: session.visitorId, createdAt: session.createdAt, expireTime: session.expireTime,
        user: {
            id: user.id, username: user.username, userType: user.userType
        }
    };
    console.log(`req.session:  ${JSON.stringify(req.session)}`);
    // await asyncLocalStorage.enterWith(req.session); // TODO: See if i keep or remove this
}