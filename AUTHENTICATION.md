# Authentication

This application is bundled with a basic implementation
of an LDAP server.

See how to run the server in `ldapjs/README.md`.

The Express server connects to the LDAP server, so make
sure it is running before you start the Express server.

To see where the authentication middleware is, go to
`src/server/passport.js`. You will see the lines
`passport.use('ldap'`.

That custom middleware function queries users from
the LDAP server by providing a `username` and `password`
to the server.

If there was a user lookup error, the middleware
returns an empty object. In this `/login` endpoint,
this is handled properly by responding to the client
with an HTTP 401 Unauthorized Error.

**Guidelines:** Do not respond with a detailed error
message. Currently, the `/login` endpoint responds
properly by giving the general error JSON response of
`{ message: 'Invalid credentials.' }`.