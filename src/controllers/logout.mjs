import Session from "../models/session.mjs";
import Database from "../models/database.mjs";
import asyncLocalStorage from "../utils/async-local-storage.mjs";

/**
 *
 * @param req
 * @param res
 * @return {*|boolean} true if the user was authenticated and was successfully logged out. If not false.
 */
export default function logoutController(req, res) {
    if (req?.session?.id && !Session.isExpiredSessionDb(req?.session?.createdAt, req?.session?.expireTime)) {
        // If user is authenticated or logged in (req.session.id) and the session is not expired, remove
        // the session cookie and the session record and redirect to home page
        const session = Database.query(Session.db, Session.dbTableName, req.session.id);
        const sessionCookieName= 'sessionId';
        const sameSitePolicySessionCookie = 'Strict';
        res.setHeader('Set-Cookie', `${sessionCookieName}=${session.id}; Max-Age=0; SameSite=${sameSitePolicySessionCookie}; HttpOnly; Secure`);
        Database.delete(Session.db, Session.dbTableName, session.id);
        asyncLocalStorage.disable()
        return true;
    } else {
        // If user is not authenticated/logged in, redirect to login route
        return false;
    }
}