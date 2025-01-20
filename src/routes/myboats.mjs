import fsSync from "node:fs";
import path from "node:path";
import Boat from "../models/boat.mjs";
import Database from "../models/database.mjs";
import Address from "../models/address.mjs";
import Image from "../models/image.mjs";
import Myboats from "../views/pages/myboats.mjs";
import Layout from "../views/layout.mjs";
import fs from "node:fs/promises";
import {ACCOUNT_TYPES} from "../utils/constants.mjs";
import BoatCard from "../views/boat-card.mjs";
import {GoogleGenerativeAI} from "@google/generative-ai";
/**
 * Route handler for the home page
 *
 * @param req
 * @param res
 */
export default async function myBoatsRoute(req, res) {
    // Converts local file information to a GoogleGenerativeAI.Part object.
    function fileToGenerativePart(path, mimeType) {
        return {
            inlineData: {
                data: Buffer.from(fsSync.readFileSync(path)).toString("base64"),
                mimeType
            },
        };
    }
    switch (req.method) {
        case 'OPTIONS':
            /*
            This method be used to test the allowed HTTP methods for a request or to determine whether a request would
            succeed when making a CORS preflighted request. A client can specify a URL with this method, or an asterisk
            (*) to refer to the entire server.
            In CORS, a preflight request is sent with the OPTIONS method so that the server can respond if it is
            acceptable to send the request.

            @see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS
            @see: https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
            */
            res.writeHead(204,
                {
                    'Allow': 'OPTIONS, HEAD, GET, POST',
                    'Access-Control-Allow-Methods': 'OPTIONS, HEAD, GET, POST',
                    'Accept-Post': 'application/json',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Expose-Headers': 'Cache-Control ,Content-Type',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Max-Age': '86400'
                }
            ); // 204 – No Content
            return res.end();
        case 'HEAD':
            try {
                const boatsPagePath = path.resolve('build/myboats.html');
                const boatsPageFileStats = fsSync.statSync(boatsPagePath);
                // homePageFileStats.mtime; // The timestamp (UTC) indicating the last time this file was modified.
                // homePageFileStats.size; // The size of the file in bytes. 1024000 bits = 1MB
                // homePageFileStats.birthtime; // The timestamp indicating the creation time of this file.
                // Last-Modified: Specifies the last time the resource was modified on the server. The browser compares
                // this value with the current time to determine if the response is stale.
                res.writeHead(204,
                    {
                        'Content-Type': 'text/html; charset=UTF-8', 'Content-Length': boatsPageFileStats.size,
                        'Last-Modified': boatsPageFileStats.mtime
                    }
                );
                return res.end();
            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Server Error');
            }
        case 'GET':
            // Protected resource. Only authenticated boat owners can access this route and can only see their own boats
            let ownerId = req?.session?.user?.id;
            if (!ownerId) { // stale=true
                // res.writeHead(401, {'WWW-Authenticate': 'Basic realm="Protected Resource", domain="/myboats"'});
                res.writeHead(303, {'Content-Type': 'text/html', 'Location': '/login'});
                return res.end(); // 401 (Unauthorized) - 303 (See Other)
            }
            if (req?.session?.user?.userType !== ACCOUNT_TYPES.BOAT_OWNER) {
                res.writeHead(303, {'Content-Type': 'text/html', 'Location': '/signup'});
                return res.end(); //  403 (Forbidden) - 303 (See Other)
            }
            let myBoatsData;
            try {
                myBoatsData = Boat.getBoatsWithImageAndAddressFromDb(null, null, null, ownerId);
                myBoatsData.forEach(boat => {
                    boat.images = JSON.parse(boat.images);
                });
            } catch (e) {
                console.error(e);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Server Error'); // 500 Internal Server Error
            }
            const acceptContentType = req?.headers['accept'];
            if (acceptContentType?.includes("*/*") ||
                acceptContentType?.includes("text/html")) {
                try {
                    const boatCardComponents = myBoatsData?.map(boatObj => BoatCard({
                        boatObj,
                        editEnabled: true
                    }))
                    const myBoats = Myboats({
                        numOfBoats: myBoatsData?.length
                    }, [boatCardComponents]);
                    const layout = Layout({
                            page: { title: 'Your Fleet'},
                            user: req?.session?.user
                        }, [myBoats]
                    );
                    await fs.writeFile('build/myboats.html', layout, {encoding: 'utf8'});
                    let myBoatsPage;
                    const myBoatsPagePath = path.resolve('build/myboats.html');
                    const myBoatsPageFileStats = await fs.stat(myBoatsPagePath);
                    myBoatsPage = await fs.readFile(myBoatsPagePath, { encoding: 'utf8' });
                    res.writeHead(200,
                        {
                            'Content-Type': 'text/html; charset=UTF-8','Content-Length': myBoatsPageFileStats.size,
                            'Last-Modified': myBoatsPageFileStats.mtime
                        }
                    );
                    return res.end(myBoatsPage);
                } catch (e) {
                    console.error(e);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Server Error'); // 500 Internal Server Error
                }
            } else if (acceptContentType?.includes("application/*") ||
                acceptContentType?.includes("application/json")) {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
                return res.end(JSON.stringify(myBoatsData));
            } else {
                // Default response body type if the request doesn't contain an 'accept' header or an accept content type is not implemented
                /*
                 MIME Type:
                 - Format: type/subtype;optionalParameter=value
                 - An optional parameter (optionalParameter) can be added to provide additional details.

                 e.g.:
                 application/json; charset=UTF-8
                 text/plain; charset=UTF-8
                 application/x-www-form-urlencoded // used in forms without files/img attached
                 multipart/form-data // used in forms with files/img attached
                 */
                res.writeHead(406, {'Content-Type': 'text/plain; charset=utf-8'}); // (406 Not Acceptable)
                return res.end(`Not Acceptable`);
            }
        case 'POST':
            //  Protected Resource only logged-in users that are boat owners can create boats.
            if (!req?.session?.user?.id) {
                res.writeHead(303, {'Content-Type': 'text/html', 'Location': '/login'});
                return res.end(); // See Other
            }
            if (req?.session?.user?.userType !== ACCOUNT_TYPES.BOAT_OWNER) {
                res.writeHead(303, {'Content-Type': 'text/html', 'Location': '/signup'});
                return res.end();
            }
            const contentType = req.headers['content-type'];
            const acceptContentTypePost = req?.headers['accept'];
            // Handle Request
            let boatId, addressId, images;
            // TODO: Input validation checks
            if (contentType?.includes("application/json") || contentType?.includes("application/x-www-form-urlencoded")) {
                // Validate input (ownerId and type)
                // Create Address
                const address = new Address(req.body?.state, req.body?.city, req.body?.country ?? 'USA', req.body?.zipCode, req.body?.street);
                addressId = Database.insert(address);
                // Create Boat
                const boat = new Boat(req.session.user.id, addressId, req.body?.type, req.body?.pricePerHour, req.body?.title);
                boatId = Database.insert(boat);
            } else if (contentType?.includes("multipart/form-data")) { // Form with Images
                // Create Address
                const address = new Address(req.body?.state, req.body?.city, req.body?.country ?? 'USA', req.body?.zipCode, req.body?.street);
                addressId = Database.insert(address);
                // Create Boat
                const boat = new Boat(req.session.user.id, addressId, req.body?.type, req.body?.pricePerHour, req.body?.title, null);
                boatId = Database.insert(boat);
                // Create Image/s (linked to the boat)
                // Turn images to Part objects
                console.log(process.env.NODE_APP_ROOT_DIR); // /Users/kikoferrer/Documents/Apps/web-applications/ahoi
                // `${process.env.NODE_APP_ROOT_DIR}${image.directory}/${image.pathName}`
                let imageParts = [];
                if (req.body?.boatImages instanceof Array) {
                    images = req.body?.boatImages?.map((image, index) => {
                        const img = new Image(boatId, image?.pathName, image?.name, image?.type, image?.size, index);
                        const filePart1 = fileToGenerativePart(`${process.env.NODE_APP_ROOT_DIR}${img.directory}/${img.pathName}`, img.type)
                        imageParts.push(filePart1);
                        return {id: Database.insert(img), directory: img.directory};
                    });
                } else {
                    const img = new Image(boatId, req.body?.boatImages?.pathName, req.body?.boatImages?.name, req.body?.boatImages?.type, req.body?.boatImages?.size, 0);
                    const filePart1 = fileToGenerativePart(`${process.env.NODE_APP_ROOT_DIR}${img.directory}/${img.pathName}`, img.type)
                    imageParts.push(filePart1);
                     images = [{id: Database.insert(img), directory: img.directory}];
                }
                // Use AI to update the boat description field with the given images and boat information.
                const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEMINI_AI);
                const model = genAI.getGenerativeModel({
                    model: "gemini-1.5-flash",
                    systemInstruction: "Generated responses must be more than 400 and less than 800 characters long"
                });
                const prompt = `Generate a boat description based on the following boat characteristics and images:
                    - Boat Title: ${req.body?.title}
                    - Boat Address: ${req.body?.city}, ${req.body?.state}
                    - Boat Type: ${req.body?.type}
                    - Price per Hour: $ ${req.body?.pricePerHour}
                `;
                const result = await model.generateContent({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: prompt,
                                },
                                ...imageParts,
                            ]
                        }
                    ],
                    generationConfig: {
                        responseMimeType: "text/plain",
                        temperature: 1 // [0.0, 2.0] -> Higher temperature means more diverse and creative responses. Lower temperature means more factural and logical answers.
                    }
                });
                // const result = await model.generateContent([prompt, ...imageParts]);
                boat.description = result.response.text();

                Database.updateAll(boat, boatId);
            } else {
                res.writeHead(415, {'Accept-Post': ['application/json; charset=utf-8', 'application/x-www-form-urlencoded', 'multipart/form-data']});
                return res.end(); // 415 Unsupported Media Type
            }
            // Handle Response
            const boatObj = {
                boatId,
                type: req.body?.type,
                pricePerHour: req.body?.pricePerHour,
                title: req.body?.title,
                images,
                state: req.body?.state,
                city: req.body?.city,
                country: req.body?.country ?? 'USA',
                zipCode: req.body?.zipCode,
                street: req.body?.street,
            };
            // Content Negotiation (what body response type does the client want back?)
            if (acceptContentTypePost?.includes("*/*") ||
                acceptContentTypePost?.includes("application/*") ||
                acceptContentTypePost?.includes("application/json")) {
                // Default response body type globally and for 'application/' types
                res.writeHead(201, {'Content-Type': 'application/json; charset=UTF-8'});
                return res.end(JSON.stringify(boatObj));
            } else if (acceptContentTypePost?.includes("text/plain")) {
                const boatCard = BoatCard({
                        boatObj
                    },
                );
                res.writeHead(201, { 'Content-Type': 'text/plain; charset=UTF-8' });
                return res.end(boatCard);
            } else {
                // Default response body type if the request doesn't contain an 'accept' header or an accept content type is not implemented
                /*
                 MIME Type:
                 - Format: type/subtype;optionalParameter=value
                 - An optional parameter (optionalParameter) can be added to provide additional details.

                 e.g.:
                 application/json; charset=UTF-8
                 text/plain; charset=UTF-8
                 application/x-www-form-urlencoded // used in forms without files/img attached
                 multipart/form-data // used in forms with files/img attached
                 */
                res.writeHead(406, {'Content-Type': 'text/plain; charset=utf-8'}); // (406 Not Acceptable)
                return res.end(`Not Acceptable`);
            }
        default:
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET, POST'}); // 405 – Method Not Allowed
            return res.end();
    }
}