# LDAP Server

This basic LDAP server is to be used for testing purposes only.
It is not meant for production use.

Please see the OpenLDAP implementations for production-ready servers.

To run the server:
```
npm start
```

The users are stored in the file `passwd`. In production,
the LDAP server should connect to a database or use a
more secure form of identity management.
