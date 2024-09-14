export default function errorHandling(err, req, res) {
    console.info('-errorHandling Middleware');
    console.error(err); // Log the error for debugging
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end(err.message);
}