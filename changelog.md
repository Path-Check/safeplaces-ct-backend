# Changelog

## v2.1.0 - Tuesday, August 18, 2020

### Updates

- Complete E2E user management and onboarding functionality
- Updates to READMEs
- Update cursor.json to include checksum values
- Remove HASHING_TEST environment variables from env.template and disable in production environments
- Return application version number in from `/organization/configuration` endpoints

### Breaking Changes

In order to make use of user management functionality the `AUTH0_MANAGEMENT_ENABLED` environment variable must be set to `true` and the following environment variables must be set with your Auth0 management API credentials:

```
AUTH0_MANAGEMENT_API_AUDIENCE
AUTH0_MANAGEMENT_CLIENT_ID
AUTH0_MANAGEMENT_CLIENT_SECRET
```

## v2.0.0 - Thursday, July 23, 2020

### Updates
- Move case points related endpoints to new standalone [discreet to duration format translation service](https://github.com/Path-Check/safeplaces-backend-translation)
- Add CSRF protection
- Increased logging in service responsible for publishing
- Small bug fixes and general cleanup of codebase

### Breaking Changes

This release is not backwards compatible. A deployed instance of the [SafePlaces Translation Service](https://github.com/Path-Check/safeplaces-backend-translation) is required to maintain baseline application functionality. In order to insure a smooth deploy it is recommended that you deploy SafePlaces in the following order:

1. Configure and deploy the [SafePlaces Translation Service](https://github.com/Path-Check/safeplaces-backend-translation)
2. Deploy the most recent release (master branch) of the [SafePlaces Frontend](https://github.com/Path-Check/safeplaces-frontend)
3. Deploy this release of the SafePlaces Backend
