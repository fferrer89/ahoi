import path from "node:path";
import fs from "node:fs";

// Load SSL/TLS key and certificate files
const sslCertificatePath = path.resolve('.sslCertificate');
const privateKeyPath = path.join(sslCertificatePath, 'private-key.pem');
const certificatePath = path.join(sslCertificatePath, 'certificate-ssl-ahoi-dev.pem');
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const certificate = fs.readFileSync(certificatePath, 'utf8');

/**
 * Obtain a self-signed SSL certificate. When deploying to production environment obtain a trusted certificate instead.
 * Generate the certificate on UNIX running the following commands on the terminal CLS:
 *  1- Generate a private key named 'private-key.pem'
 *      - openssl genpkey -algorithm RSA -out private-key.pem
 *  2- Generate a certificate signing request named 'csr.pem'. Sends the csr.pem file to the chosen Certificate
 *  Authority to request a signed certificate. Returns a signed certificate file (usually in PEM format), validated by
 *  the Certificate Authority.
 *      - openssl req -new -key private-key.pem -out csr.pem
 *  3- Generate a self-signed certificate named 'certificate-ssl-ahoi-dev.pem'. Returns the following: "subject=C=US,
 *  ST=Illinois, L=Chicago, O=Ahoi, CN=localhost, emailAddress=ffcatala@gmail.com"
 *      - openssl x509 -req -days 365 -in csr.pem -signkey private-key.pem -out certificate-ssl-ahoi-dev.pem
 *
 * private-key.pem
 * - US, Illinois, Chicago, Ahoi Boating Services, localhost (www.ahoi.app for production), ffcatala@gmail.com (info@ahoi.com)
 *
 * @see https://nodejs.org/api/https.html
 * @see https://mirzaleka.medium.com/a-detailed-look-into-the-node-js-http-module-680eb5e4548a
 * @type {{cert: Buffer | string, key: Buffer | string}}
 */
const sslCredentials = {
    key: privateKey,
    cert: certificate,
};
export default sslCredentials;
