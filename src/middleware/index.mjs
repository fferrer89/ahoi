import logger from "./logger.mjs";
import responseHeaders from "./responseHeaders.mjs";
import publicResource from "./publicResource.mjs";
import handleBody from "./handleBody.mjs";
import requestHeaders from "./requestHeaders.mjs";
import visitor from "./visitor.mjs"; // Web Visitor
import session from "./session.mjs"; // Auth Session

/**
 * Middleware function that intercepts the requests and responses between a client and a server. It acts as a bridge,
 * modifying or processing the data before it reaches the final destination or after it has been generated. The order
 * of the function calls within the middleware matters.
 *
 * Key functions of middleware:
 *   - Request handling: Middleware can examine incoming requests, extract information, and decide how to proceed based
 *   on specific criteria.
 *   - Response modification: It can modify outgoing responses, adding headers, changing content, or even generating
 *   new responses entirely.
 *   - Authentication and authorization: Middleware can verify user identities and grant or deny access to resources
 *   based on permissions.
 *   - Error handling: It can intercept errors, log them, and provide appropriate responses to the client.
 *   - Data validation: Middleware can validate input data to ensure it meets specific requirements and prevent
 *   malicious attacks.
 *   - Caching: It can cache responses to improve performance and reduce load on the server.
 *
 * Common examples of middleware:
 *   - Authentication middleware: Verifies user credentials and grants or denies access to protected resources (e.g.:
 *   /dashboard).
 *   - Logging middleware: Records information about incoming and outgoing requests for analysis and troubleshooting.
 *   - Body parsing middleware: Parses request bodies (for example, JSON, form data) for processing.
 *   - CORS middleware: Enables cross-origin resource sharing, allowing requests from different domains.
 *   - Rate limiting middleware: Limits the number of requests a client can make within a specific time frame.
 *
 * @param req
 * @param res
 */
export default function middlewares(req, res) {
    requestHeaders(req, res);
    logger(req, res);
    responseHeaders(req, res);
    handleBody(req, res);
    publicResource(req, res); // This can end the req/res cycle (res.end()), so next statements have to check for it (!res.writableEnded)
    !res.writableEnded && visitor(req, res); // Web Visitor
    !res.writableEnded && session(req, res);
    // !res.writableEnded && protectedResources(req, res); // Authentication middleware
}