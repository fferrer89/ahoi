import logger from "./logger.mjs";
import responseHeaders from "./responseHeaders.mjs";
import sessionVisitor from "./session-visitor.mjs";

export default function middlewares(req, res) {
    logger(req, res);
    responseHeaders(req, res);
    sessionVisitor(req, res);
}