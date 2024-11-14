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
        fs.mkdirSync(directoryPath, { recursive: true } );
        console.info(`Directory ${directoryPath} created successfully.`);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
        console.warn(`Directory ${directoryPath} already exists.`);
    }
}

function decodeBasicAuth(authHeader) {
    const base64Credentials = authHeader.split(' ')?.[1]; // 'Basic YWRkc2Zhc2Q6c2Zhc2Rm';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');
    return { email, password };
}

/**
 * Takes as string input representing a valid date in the following format (2024-11-10T06:26) and converts to a string \
 * output representing a date in this valid format (2024-11-10 06:26:00). This is used as the date-time stored in the
 * sqlite db are stored in the output format, but the date-time return from the HTML form is in the input format.
 *
 * For example:
 *  2024-11-10T06:26 -> 2024-11-10 06:26:00
 *  2024-11-10T17:54 -> 2024-11-10 17:54:00
 *  2024-11-10T20:00 -> 2024-11-10 20:00:00
 *
 * @param {string} inputDate a valid date in the following format (e.g.: 2024-11-10T06:26)
 * @return {string} the inputted date converted to the following format (e.g.: 2024-11-10 06:26:00)
 */
function convertDateFormat(inputDate) {
    // Split the input date string into date and time parts
    const [datePart, timePart] = inputDate.split('T');
    // Extract the time part without the 'T'
    const timeWithoutT = timePart.substring(0, timePart.length);
    // Add seconds to the time part
    const timeWithSeconds = `${timeWithoutT}:00`;
    // Combine the date and time parts with a space
    return `${datePart} ${timeWithSeconds}`;
}

/**
 * Example usage:
 * const inputDate = '2024-11-13 14:30:00';
 * const formattedDate = formatDate(inputDate);
 * console.log(formattedDate); // Output: "13th November, Wednesday"
 * @param inputDate
 */
function formatDate(inputDate) {
    // Create a Date object from the input string
    const date = new Date(inputDate);
    // Get the day, month, and weekday using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short', // long, short
        weekday: 'long'
    });
    const formattedDate = formatter.format(date); // Wednesday, November 13
    // Extract the day and add the ordinal suffix
    const dateFormatted = formattedDate.split(' ');
    const weekday = dateFormatted[0].slice(0, -1); // Wednesday
    const month = dateFormatted[1]; // November
    const day = parseInt(dateFormatted[2]); // 13
    const daySuffix = getOrdinalSuffix(day); // th
    return { day, daySuffix, month, weekday };
}
function getOrdinalSuffix(day) {
    if (day % 10 === 1 && day !== 11) {
        return 'st';
    } else if (day % 10 === 2 && day !== 12) {
        return 'nd';
    } else if (day % 10 === 3 && day !== 13) {
        return 'rd';
    } else {
        return 'th';
    }
}

export { fileExtensionToMIMEType, createDirectoryIfNotExists, convertDateFormat, decodeBasicAuth, formatDate};