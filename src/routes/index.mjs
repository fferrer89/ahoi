
import homeRoute from "./home.mjs";
import aboutRoute from "./about.mjs";
import boatsRoute from "./boats.mjs";
import myBoatsRoute from "./my-boats.mjs";
import loginRoute from "./login.mjs";
import signupRoute from "./signup.mjs";
import imageRoute from "./image.mjs";
import logoutRoute from "./logout.mjs";
import notFoundController from "../controllers/not-found.mjs";

/**
 * Route handling based on the pathname
 *
 * @param req
 * @param res
 */
export default async function routes(req, res) {
    console.info('-routes');
    console.log(`pathname: ${req.pathname}`);
    switch (req.pathname) {
        case '/':
            homeRoute(req, res);
            break;
        case '/about':
            aboutRoute(req, res);
            break;
        case '/boats':
            // /boats?location=Chicago%2C+IL&date=2024-09-27&boatType=motorboat&ownerId=134
            // /boats?ownerId=:userId -> "Your Fleet"
            boatsRoute(req, res);
            break;
        case '/my-boats':
            // TODO: Protected resource. Only authenticated boat owners can access this route and can only see their own boats
            myBoatsRoute(req, res);
            break;
        case `/boats/${req.params?.boatId}`: // FIXME: check whether '/boats/' takes this route and fix it if it does
            // boatRoute(req, res);
            break;
        case '/boats/bookings': //  Your boat reservation (for Boat Owner)
            // TODO: Protected resource. Only authenticated boat renters can access this route and can only see their own bookings
            // /boats/bookings → "Your Boat Bookings" (Admin user can see ALL boat bookings)
            // boatsBookingsRoute(req, res);
            break;
        case '/boats/bookings/:bookingId': // A specific boat reservation (for Boat Owner)
            // boatsBookingRoute(req, res);
            break;
        case '/users': // ???
            // GET returns all users and is only accessible to admin user. (Admin user can see ALL boat bookings)
            // POST same as signup ??
            break;
        case `/users/${req.params?.userId}`: // FIXME: check whether '/users/ ' takes this route and fix it if it does
            // /users/:userId -> "Your Profile" (To update the user personal information)
            res.writeHead(200);
            res.end(`/users/${req.params.userId}`);
            break;
        case `/users/bookings`:
            // /users/bookings → "Your Bookings" (Admin user can see ALL user bookings)
            // bookingsRoute(req, res);
            break;
        case `/users/bookings/:bookingId`:
            // bookingRoute(req, res);
            break;
        case `/uploads/images/${req.params?.imageId}`:
            imageRoute(req, res);
            break;
        case '/login':
            loginRoute(req, res);
            break;
        case '/signup':
            signupRoute(req, res);
            break;
        case '/logout':
            logoutRoute(req, res);
            break;
        default:
            notFoundController(req, res);
    }
}