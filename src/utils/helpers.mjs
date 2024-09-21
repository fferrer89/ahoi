/**
 * Function that takes a file extension (.css) and returns its corresponding MIME type (text/css).
 *
 * Other content types: application/x-www-form-urlencoded, multipart/form-data, image/x-icon (.ico), etc
 *
 * @param fileExtension the file extension, such as .css, .html, or .mjs.
 * @return {undefined|string} the corresponding MIME type, such as text/css, text/html, or text/javascript or undefined
 * if the file extension is not recognized.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
 */
function fileExtensionToMIMEType(fileExtension) {
    switch (fileExtension) {
        case '.css':
            return 'text/css';
        case '.html':
            return 'text/html';
        case '.txt':
            return 'text/plain';
        case '.json':
            return 'application/json';
        case '.mjs':
            return 'text/javascript';
        case '.ico':
            return 'image/vnd.microsoft.icon';
        case '.svg':
            return 'image/svg+xml';
        case '.png':
            return 'image/png';
        case '.jpg':
            return 'image/jpeg';
        case '.jpeg':
            return 'image/jpeg';
        default:
            return undefined;
    }
}

export { fileExtensionToMIMEType };