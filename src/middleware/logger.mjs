export default function logger(req, res) {
    const logMessage = `Req: ${req.method} ${req.url}`;
    console.log(logMessage);
}