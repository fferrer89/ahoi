import homeRoute from "./home.mjs";
import aboutRoute from "./about.mjs";
import boatsRoute from "./boats.mjs";
import myBoatsRoute from "./my-boats.mjs";
import loginRoute from "./login.mjs";
import signupRoute from "./signup.mjs";
import imageRoute from "./image.mjs";
import logoutRoute from "./logout.mjs";
import notFoundController from "../controllers/not-found.mjs";
import asyncLocalStorage from "../utils/async-local-storage.mjs";

/**
 * Route handling based on the pathname
 *
 * @param req
 * @param res
 */
export default async function routes(req, res) {
    console.log('- Gets Store');
    const store = asyncLocalStorage.getStore();
    console.log(store?.get('session'));
    switch (req.pathname) {
        case '/':
            homeRoute(req, res);
            break;
        case '/about':
            aboutRoute(req, res);
            break;
        case '/boats':
            // /boats?location=Chicago%2C+IL&date=2024-09-27&boatType=motorboat&ownerId=134
            boatsRoute(req, res);
            break;
        case `/boats/${req.params?.boatId}`: // FIXME: check whether '/boats/' takes this route and fix it if it does
            // boatRoute(req, res);
            break;
        case `/boats/${req.params?.boatId}/bookings`:
            // Protected resource for Boat Renters. You must be an authenticated boat renter to post a booking for a boat
            // POST to post a booking for this boat
            // When the user clicks the "Book" button, a dialog will appear with the info about the booking and a confirmation button that when
            // clicked, submits the booking request
            break;
        case '/boats/bookings': //  Your boat bookings (Boat Renter)
            // Protected resource for Boat Renters. See all/upcoming bookings that this renter has made
            // bookingsRoute(req, res);
            break;
        case '/my-boats':
            // Protected resource for Boat Owner
            myBoatsRoute(req, res);
            break;
        case '/my-boats/:boatId':
            // Protected resource for Boat Owner
            // myBoatRoute(req, res);
            break;
        case '/my-boats/bookings':
            // Protected resource for Boat Owner to see all the bookings for all his boats. Upcomming bookings, ...
            // bookingsRoute(req, res); OR myBoatBookingsRoute(req, res); if need to be different that the name used for the '/boats/bookings' route
            break;
        case `/users/${req.params?.userId}`: // FIXME: check whether '/users/ ' takes this route and fix it if it does
            // /users/:userId -> "Your Profile" (To update the user personal information)
            // userRoute(req, res);
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
        case `/uploads/images/${req.params?.imageId}`:
            imageRoute(req, res);
            break;
        default:
            notFoundController(req, res);
    }
}