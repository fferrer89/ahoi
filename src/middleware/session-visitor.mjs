import Session from "../models/session.mjs";
// import {AsyncLocalStorage} from "async_hooks";
// const asyncLocalStorage = new AsyncLocalStorage();
/**
 * Session middleware
 *
 * expireSessionCookieSec of 86_400 seconds === 1 day
 *
 */
export default function sessionVisitor(req, res) {
    console.info('-sessionVisitorMiddleware');
    const sessionName= 'ahoiSessionId';
    const expireSessionCookieSec = 3600; // Time stored as UTC timestamp, so Max-Age=3600 is UTC time now + 1 hour
    const sameSitePolicySessionCookie = 'Strict';
    const cookies = req?.headers['cookie']?.split(';')?.map(cookie => {
        const [name, value] = cookie?.split('=');
        return {name, value};
    });
    const ahoiSessionCookie = cookies?.find(cookie => cookie?.name === sessionName);
    console.log(`ahoiSessionCookie:  ${JSON.stringify(ahoiSessionCookie)}`);
    let ahoiSession;
    if (ahoiSessionCookie) {
        ahoiSession = Session.getSessionFromDb(ahoiSessionCookie.value);
        if (!ahoiSession || Session.isSessionDbExpired(ahoiSession.createdAt, ahoiSession.expireTime)) {
            ahoiSession = new Session(expireSessionCookieSec, true);
        }
    } else {
        ahoiSession = new Session(expireSessionCookieSec, true);// In-memory session store
        res.setHeader('Set-Cookie', `${sessionName}=${ahoiSession.id}; Max-Age=${expireSessionCookieSec}; SameSite=${sameSitePolicySessionCookie}; HttpOnly; Secure`);
    }
    req.session = {id: ahoiSession.id, userId: ahoiSession.userId};
    console.log(`req.session:  ${JSON.stringify(req.session)}`);
    // await asyncLocalStorage.enterWith(req.session); // TODO: See if i keep or remove this
}