/**
 * Handle body for and put it in req.body
 *
 * Body parsing middleware that parses request bodies (for example, JSON, form data) for processing.
 *
 * This method should parse the following types:
 *   - form-data (contains files)
 *   - x-www-form-urlencoded (forms that don't contain files)
 *   - JSON
 *   - text
 *
 * @param req
 * @param res
 */
export default function handleBody(req, res) {
    console.info('-handleBodyMiddleware');
    const contentType = req.headers['content-type'];
    let parsedBody;
    if(req.body && req.body?.length > 0) {
        if (contentType === 'application/json') {
            parsedBody = JSON.parse(Buffer.concat(req.body).toString());
        } else if (contentType === 'text/plain') {
            parsedBody = Buffer.concat(req.body).toString('utf-8');
        } else if (contentType === 'application/x-www-form-urlencoded') {
            const searchParams = new URLSearchParams(Buffer.concat(req.body).toString());
            parsedBody = {};
            for (let [key, value] of searchParams.entries()) {
                parsedBody[key] = value;
            }
        } else {
            // Handle other content types or default to raw body
            parsedBody = Buffer.concat(req.body).toString();
        }
        req.body = parsedBody;
    } else {
        delete req.body;
    }
}