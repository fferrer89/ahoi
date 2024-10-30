import path from "node:path";
import fs from "node:fs";

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
            parsedBody = JSON.parse(req.body.toString());
        } else if (contentType === 'text/plain') {
            parsedBody = req.body.toString();
        } else if (contentType === 'application/x-www-form-urlencoded') {
            const searchParams = new URLSearchParams(req.body.toString());
            parsedBody = {};
            for (let [key, value] of searchParams.entries()) {
                parsedBody[key] = value;
            }
        } else if (contentType?.startsWith('multipart/form-data')) {
            parsedBody = {};
            // Content-Type: multipart/form-data;boundary="boundary-code"
            const boundary = contentType.split('=')[1]; // boundary-code
            const parts = req.body.join('').split(boundary).slice(1, -1);
            const formData = new FormData();
            parts.forEach(part => {
                const headers = part.split('\r\n\r\n')[0]?.split('\r\n');
                const contentDisposition = headers.find(header => header.startsWith('Content-Disposition'));
                // Content-Disposition: form-data; name="field1"; filename="example.txt"
                // Content-Type: text/plain
                const fieldName = contentDisposition?.match(/name="([^"]+)"/i)[1].trim();
                if (contentDisposition.includes('filename')) {
                    // Handle file uploads
                    const fileName = contentDisposition?.match(/filename="([^"]+)"/i)[1].trim();
                    const fileNameCleaned = fileName.replaceAll(' ', '_').replaceAll('-', '_');
                    const contentType =  headers.find(header => header.startsWith('Content-Type')).split(': ')[1];
                    const fileContent = part.split('\r\n\r\n')[1]?.split('\r\n--')[0];

                    // Store file in FormData() object
                    const file = new Blob([fileContent], { type: contentType });
                    formData.set(fieldName, file, fileName);
                    const fileCreatedTime = formData.get(fieldName)?.lastModified ?? 'unknown';
                    // const userId = req?.session?.user?.id ?? 'unknown';
                    // formData.get(fieldName).pathName = `${userId}-${fileCreatedTime}-${fileNameCleaned}`;
                    formData.get(fieldName).pathName = `${fileCreatedTime}-${fileNameCleaned}`;

                    // Write field content to disk
                    const filePath = path.join('./uploads/photos', formData.get(fieldName)?.pathName);
                    fs.writeFileSync(filePath, fileContent, { encoding: 'binary' });
                } else {
                    // Handle other form fields
                    const value = part.split('\r\n\r\n')[1]?.split('\r\n')[0];
                    // Store field in FormData() object
                    formData.set(fieldName, value);
                }
            })
            // Convert formData to a JS object
            formData.forEach((value, key) => {
                if (value instanceof Blob) {
                    parsedBody[key] = {
                        size: value.size,
                        type: value.type,
                        name: value.name,
                        pathName: value.pathName,
                        lastModified: value.lastModified,
                    }
                } else {
                    parsedBody[key] = value
                }
            })
        } else {
            // Handle other content types or default to raw body
            parsedBody = Buffer.concat(req.body).toString();
        }
        req.body = parsedBody;
    } else {
        delete req.body;
    }
}