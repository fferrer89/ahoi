import {decodeBasicAuth} from "../utils/helpers.mjs";
import User from "../models/user.mjs";
import Session from "../models/session.mjs";

export default function authChallenge(req, res) {
    const authorization = req.headers['authorization'];
    res.setHeader('authorization', '');
    if (authorization && !req.session?.id) {
        const { email, password} = decodeBasicAuth(authorization);
        const user =  User.getLoginUserFromDb(email, password);
        if (user) {
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
        }
    }
}