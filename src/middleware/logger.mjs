export default function logger(req, res) {
    console.info('-loggerMiddleware');
    const logMessage = `Request received: ${req.method} ${req.url}`;
    console.log(logMessage);
}