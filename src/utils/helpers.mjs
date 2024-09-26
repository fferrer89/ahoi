import fs from "node:fs";

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

/**
 * This function takes a file path directory such as "/Users/kikoferrer/.config/ahoi" and creates the directory "ahoi".
 *
 * @param directoryPath the file path with the directory to create, such as "/Users/kikoferrer/.config/ahoi"
 */
function createDirectoryIfNotExists(directoryPath) {
    try {
        fs.mkdirSync(directoryPath);
        console.info(`Directory ${directoryPath} created successfully.`);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
        console.warn(`Directory ${directoryPath} already exists.`);
    }
}

export { fileExtensionToMIMEType, createDirectoryIfNotExists};