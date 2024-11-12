export default function routeParams(req, res) {
    const urlParts = req.pathname.split('/'); // /boats/1234 -> [ '', 'boats', '1234' ]
    const boatsRegex = /^\/boats\/[0-9]+$/; // '/boats/1234567890', '/boats/9', '/boats/0', ...
    const boatBookingsRegex = /^\/boats\/[0-9]+\/bookings$/; // '/boats/1234567890/bookings', '/boats/9/bookings', '/boats/0/bookings', ...
    const usersRegex = /^\/users\/[0-9]+$/; // '/users/000567890', '/users/9', '/users/0', ...
    const photosRegex = /^\/uploads\/images\/[0-9]+$/;
    const seedPhotosRegex = /^\/tasks\/uploads\/images\/[0-9]+$/;

    if (boatsRegex.test(req.pathname)) { // /boats/1234
        req.params = { boatId: urlParts?.[2] }
        req.basePathname = '/boats';
    } else if (boatBookingsRegex.test(req.pathname)) { // /boats/009860/bookings
        req.params = { boatId: urlParts?.[2] } // boatId[2] -> '009860'
        req.basePathname = '/boats';
    } else if (usersRegex.test(req.pathname)) { // /users/009860
        req.params = { userId: urlParts?.[2] } // userId[2] -> '009860'
        req.basePathname = '/users';
    } else if (photosRegex.test(req.pathname)) {
        req.params = { imageId: urlParts?.[3] } // imageId[3] -> '1730320042633-boat.png'
        req.basePathname = '/uploads/images';
    } else if (seedPhotosRegex.test(req.pathname)) {
        req.params = { imageId: urlParts?.[4] } // imageId[4] -> '1730320042633-boat.png'
        req.basePathname = '/tasks/uploads/images';
    }
}