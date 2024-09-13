# Ahoi
Boating website where boat owners can publish their boat and people looking for boats can rent published boats.\

This website is built exclusively using HTML, CSS, and vanilla JavaScript for the front-end. The back-end is built in
Node.js using exclusively built-in modules, so no dependencies have been imported into this application.

## Production Deployment Steps
- Remove --watch option from the start node command in package.json.
- Create a dot-env (.env) file with the values for production. For example, the value for HOSTNAME should be ahoi.app
- Upload the dot-env (.env) file to the web hosting service (AWS Lightsail)
