// import asyncLocalStorage from "../utils/async-local-storage.mjs";
import homeRoute from "./home.mjs";
import aboutRoute from "./about.mjs";
import boatsRoute from "./boats.mjs";
import myBoatsRoute from "./myboats.mjs";
import loginRoute from "./login.mjs";
import signupRoute from "./signup.mjs";
import imageRoute from "./image.mjs";
import logoutRoute from "./logout.mjs";
import notFoundController from "../controllers/notfound.mjs";
import boatRoute from "./boat.mjs";
import boatBookingsRoute from "./boat-bookings.mjs";
import bookingsRoute from "./bookings.mjs";

/**
 * Route handling based on the pathname
 *
 * @param req
 * @param res
 */
export default async function routes(req, res) {
    // console.log('- Gets Store');
    // const store = asyncLocalStorage.getStore();
    // console.log(store?.get('session'));
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
        case `/boats/${req.params?.boatId}`:
            boatRoute(req, res);
            break;
        case `/boats/${req.params?.boatId}/bookings`:
            // Protected resource for Boat Renters. You must be an authenticated boat renter to post a booking for a boat
            // POST to post a booking for this boat
            // When the user clicks the "Book" button, a dialog will appear with the info about the booking and a confirmation button that when
            // clicked, submits the booking request
            // POST redirects to the booking confirmation page or to the '/boats/bookings'
            boatBookingsRoute(req, res);
            break;
        case '/boats/bookings': //  Your boat bookings (Boat Renter)
            // Protected resource for Boat Renters. See all/upcoming bookings that this renter has made
            // POST to post a booking for this boat
            bookingsRoute(req, res);
            break;
        case '/boats/bookings/:bookingId': //  Your boat bookings (Boat Renter)
            // Protected resource for Boat Renters. See all/upcoming bookings that this renter has made
            // POST to post a booking for this boat
            // bookingsRoute(req, res);
            break;
        case '/myboats':
            // Protected resource for Boat Owner
            myBoatsRoute(req, res);
            break;
        case '/myboats/:boatId':
            // Protected resource for Boat Owner
            // myBoatRoute(req, res);
            break;
        case '/myboats/bookings':
            // Protected resource for Boat Owner to see all the bookings for all his boats. Upcomming bookings, ...
            // myboatsBookingsRoute(req, res); OR myBoatBookingsRoute(req, res); if need to be different that the name used for the '/boats/bookings' route
            break;
        case '/myboats/bookings/:bookingId':
            // Protected resource for Boat Owner to see all the bookings for all his boats. Upcomming bookings, ...
            // myboatsBookingRoute(req, res); OR myBoatBookingsRoute(req, res); if need to be different that the name used for the '/boats/bookings' route
            break;
        case `/users/${req.params?.userId}`:
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
        case `/tasks/uploads/images/${req.params?.imageId}`:
            imageRoute(req, res);
            break;
        default:
            notFoundController(req, res);
    }
}