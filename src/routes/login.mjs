import fs from "node:fs/promises";
import path from "node:path";
import Layout from "../views/layout.mjs";
import Login from "../views/pages/login.mjs";

/**
 * Route handler for the login page
 * @param req
 * @param res
 */
export default async function loginRoute(req, res) {
    switch (req.method) {
        case 'OPTIONS':
            res.writeHead(204, {'Allow': 'OPTIONS, HEAD, GET, POST'}); // 204 – No Content
            res.end();
            break;
        case 'HEAD':
            res.writeHead(204, { 'Content-Type': 'text/plain', 'Content-Language': 'en-us'});
            res.end();
            break;
        case 'GET':
            const acceptContentType = req?.headers['accept'];
            if (acceptContentType?.includes( "*/*") || acceptContentType?.includes("text/*") ||
                acceptContentType?.includes("text/html")) {
                try {
                    const login = Login();
                    const layout = Layout({
                            page: { title: 'Login'},
                            user: req?.session?.user
                        }, [login]
                    );
                    await fs.writeFile('build/login.html', layout, {encoding: 'utf8'});
                    let loginPage;
                    const loginPagePath = path.resolve('build/login.html');
                    const loginPageFileStats = await fs.stat(loginPagePath);
                    loginPage = await fs.readFile(loginPagePath, { encoding: 'utf8' });
                    res.writeHead(200,
                        {
                            'Content-Type': 'text/html; charset=UTF-8','Content-Length': loginPageFileStats.size,
                            'Last-Modified': loginPageFileStats.mtime
                        }
                    );
                    res.end(loginPage);
                } catch (e) {
                    console.error(e);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Server Error'); // 500 Internal Server Error
                }
            } else {
                res.writeHead(406, { 'Content-Type': 'text/plain' }); // 406 Not Acceptable
                res.end('Only \'text/html\' content type supported.');
            }
            break;
        case 'POST':
            res.writeHead(201, { 'Content-Type': 'text/plain' });
            res.end('This is the about page.');
            break;
        default:
            res.writeHead(405, {'Allow': 'OPTIONS, HEAD, GET, POST'}); // 405 – Method Not Allowed
            res.end('Method Not Allowed');
    }
}