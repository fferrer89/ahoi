# Ahoi
Boating website where boat owners can publish their boat and people looking for boats can rent published boats.

This website is built exclusively using HTML, CSS, and vanilla JavaScript for the front-end. The back-end is built in
Node.js leveraging only built-in modules, so no dependencies have been imported into this application.

## Production Deployment Steps
- Remove ```--watch``` option from the start node command in package.json.
- Create a dot-env (.env) file with the values for production. For example, the value for HOSTNAME should be ahoi.app
- Upload the dot-env (.env) file to the web hosting service (AWS Lightsail) at the root of the project
- Obtain a domain for this application: www.ahoi.app 
- Obtain and upload a trusted SSL certificate (HTTPS) from the prod CLI server
  - Create a folder named .sslCertificate at the root of the project. Move inside the new directory and run the following commands:
    - ```openssl genpkey -algorithm RSA -out private-key.pem'```
    - ```openssl req -new -key private-key.pem -out csr.pem```
      - Inputs: US, Illinois, Chicago, Ahoi Boating Services, www.ahoi.app, info@ahoi.com
    - ```openssl x509 -req -days 365 -in csr.pem -signkey private-key.pem -out certificate-ssl-ahoi.pem```
