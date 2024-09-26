import url from "node:url"; // The node:url module provides utilities for URL resolution and parsing.

/**
 * Sets the request headers that are common across all the request, and includes them to the request (req) object
 * req.method, req,url, req.headers, req.pathname, req.query, req.cookies, req.body, ...
 */
export default function requestHeaders(req, res) {
    console.log('-requestHeadersMiddleware');
    // POST https://localhost:3000/boats?location=Chicago%2C+IL&date=2024-09-27&boatType=motorboat
    // console.log(`req.method: ${req.method}`); // POST
    // console.log(`req.url: ${req.url}`); // /boats?location=Chicago%2C+IL&date=2024-09-27&boatType=motorboat
    // console.log(`req.headers: ${JSON.stringify(req.headers)}`); // {"accept":"text/html","x-api-key":"{{token}}"
    // console.log(`req?.headers['cookie']: ${req?.headers['cookie']}`); // ahoiPrefColor=White; ahoiSessionId=3
    const parsedUrl = url.parse(req.url, true);
    req.pathname = parsedUrl.pathname; // /boats
    req.query = parsedUrl.query; // can be an empty object if the url does not contain any query parameters
    // console.log(`req.query.location: ${req.query.location}`); //  Chicago, IL
    let cookies = {};
    req.headers['cookie']?.split(';').forEach(cookie => {
        const [name, value] = cookie?.split('=');
        cookies[name.trim()] = value.trim();
    })
    req.cookies = cookies; // { ahoiPrefColor: 'White', ahoiSessionId: '2', ahoiLastVisited: '2024-09-25 13:16:15' }
}