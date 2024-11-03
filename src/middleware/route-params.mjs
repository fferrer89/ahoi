export default function routeParams(req, res) {
    const urlParts = req.pathname.split('/'); // /boats/1234 -> [ '', 'boats', '1234' ]
    const boatsRegex = /^\/boats\/[0-9]+$/; // '/boats/1234567890', '/boats/9', '/boats/0', ...
    const usersRegex = /^\/users\/[0-9]+$/; // '/users/000567890', '/users/9', '/users/0', ...
    const photosRegex = /^\/uploads\/images\/.+$/;
    if (boatsRegex.test(req.pathname)) { // /boats/1234
        // console.log(urlParts);
        // console.log(`urlParts[1]: ${urlParts[2]}`); // urlParts[2] -> '1234'
        req.params = { boatId: urlParts?.[2] }
    } else if (usersRegex.test(req.pathname)) { // /boats/009860
        req.params = { userId: urlParts?.[2] } // userId[2] -> '009860'
    } else if (photosRegex.test(req.pathname)) {
        req.params = { imageId: urlParts?.[3] } // imageId[3] -> '1730320042633-boat.png'
    }
}