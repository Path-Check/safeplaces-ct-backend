# Description

Node Back-end for [MIT's Safe Places App](https://github.com/tripleblindmarket/safe-places).

## Features:

- Swagger API Spec at: `/spec`
- One config file (Simple)
- Two-Factor Authentication Ready, but Endpoint to match [the current API specification](https://github.com/tripleblindmarket/safe-places/blob/develop/Safe-Places-Server.md) is available
- Postgres DB support
- Additional Endpoints are available to help with auth and user management (See bellow)

# TODO

- **Swagger**

  - Configure properly (as opposed to just using the plugin)

- **Configuration File**

  - Two-Factor Authentication optional/enforced

- **Types**

  - Auth module needs types for all responses (DRY in `auth.service.ts` and `auth.controller.ts`)

- **README File**

  - Index section
  - All around improvements
  - Configuration File section

- **Additional Database Support**

- **Test Code**

# Installation

You can use **npm** or **yarn**:

```bash
$ npm install

# or

$ yarn
```

In order for the application to work properly, you need to create a .env file in the app's root folder `.env`

These are the available vars:

```properties
# Application
PORT=
ORG_ID=
GOOGLE_MAP_API_KEY=

# JWT (Authentication)
JWT_SECRET=
JWT_DURATION=

# Database
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

```

# Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

<!-- # Test

Please note that I haven't written any test code yet.

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
``` -->

# Safe Path Core Endpoints

## Login

URL: `/login`

METHOD: `POST`

PAYLOAD: (JSON)

```json
{
  "username": "<username>",
  "password": "<password>"
}
```

RESPONSE: (JSON)

```json
{
  "token": "<token>",
  "maps_api_key": "<maps_api_key>"
}
```

## Save Redacted\*

_**\*[NOTE](): I am making the assumption that the `data.trail` property in the RESPONSE is actually an array (the [the current API specification](https://github.com/tripleblindmarket/safe-places/blob/develop/Safe-Places-Server.md#save-redacted) is showing `data.trail` as a single object)**_

URL: `/redacted_trail`

METHOD: `POST`

PAYLOAD: (JSON)

```json
{
  "identifier": "<identifier>",
  "trail": [
    {
      "time": 123456789,
      "latitude": 12.34,
      "longitude": 12.34
    }
  ]
}
```

RESPONSE: (JSON)

```jsonc
{
  "data": {
    "identifier": "<identifier>",
    "organization_id": "<organization_id>",
    "trail": [
      {
        "latitude": 12.34,
        "longitude": 12.34,
        "time": 123456789
      }
    ],
    "user_id": "<user_id>" // ???
  },
  "success": true
}
```

## Load Redacted

URL: `/redacted_trail`

METHOD: `GET`

RESPONSE: (JSON)

```jsonc
{
  "data": [
    {
      "identifier": "<identifier>",
      "organization_id": "<organization_id>",
      "trail": {
        "latitude": 12.34,
        "longitude": 12.34,
        "time": 123456789
      },
      "user_id": "<user_id>" // This comes from the currently logged in user
    },
    {
      "identifier": "<identifier>",
      "organization_id": "<organization_id>",
      "trail": {
        "latitude": 12.34,
        "longitude": 12.34,
        "time": 123456789
      },
      "user_id": "<user_id>" // ???
    }
  ]
}
```

## Publish

URL: `/safe_paths`

METHOD: `POST`

PAYLOAD: (JSON)

```json
{
  "authority_name": "Steve's Fake Testing Organization",
  "publish_date_utc": "1584924583",
  "info_website": "https://www.who.int/emergencies/diseases/novel-coronavirus-2019",
  "concern_points": [
    {
      "time": 123,
      "latitude": 12.34,
      "longitude": 12.34
    },
    {
      "time": 456,
      "latitude": 12.34,
      "longitude": 12.34
    }
  ]
}
```

RESPONSE: (JSON)

```json
{
  "datetime_created": "Fri, 27 Mar 2020 04:32:12 GMT",
  "organization_id": "<organization_id>",
  "safe_path": {
    "authority_name": "Fake Organization",
    "concern_points": [
      {
        "latitude": 12.34,
        "longitude": 12.34,
        "time": 123
      },
      {
        "latitude": 12.34,
        "longitude": 12.34,
        "time": 456
      }
    ],
    "info_website": "https://www.something.gov/path/to/info/website",
    "publish_date_utc": 1584924583
  },
  "user_id": "<user_id>"
}
```

## safe-paths.json\*

_**\*[NOTE](): I am making the assumption that the `data` property in the RESPONSE is actually an array ([the current API specification](https://github.com/tripleblindmarket/safe-places/blob/develop/Safe-Places-Server.md#safe-paths.json) is showing `data` as a single object)**_

URL: `/safe_paths/<organization_id>`

METHOD: `GET`

RESPONSE: (JSON)

```json
{
  "data": [
    {
      "authority_name": "Fake Organization",
      "concern_points": [
        {
          "latitude": 12.34,
          "longitude": 12.34,
          "time": 1584924233
        },
        {
          "latitude": 12.34,
          "longitude": 12.34,
          "time": 1584924583
        }
      ],
      "info_website": "https://www.something.gov/path/to/info/website",
      "publish_date_utc": "1584924583"
    }
  ]
}
```

# Additional Endpoints

## Login2 (Two-Factor-Auth)\*

_**\*[NOTE](): In case that we want to use two-factor athentication... (we wouldn't have both login endpoints available)**_

URL: `/login2`

METHOD: `POST`

PAYLOAD: (JSON)

```jsonc
{
  "username": "pablom",
  "password": "superSecurePassword123$",
  "code": "123456" // (Authy, Google Authenticator, etc.)
}
```

RESPONSE: (JSON)

```json
{
  "token": "<token>",
  "maps_api_key": "<maps_api_key>"
}
```

## Register User

Existing admin users can call this to register a new user. [You must be logged in to call this endpoint]()

URL: `/register`

METHOD: `POST`

PAYLOAD: (JSON)

```json
{
  "username": "pablom",
  "password": "superSecurePassword123$",
  "email": "pablom@fake.com",
  "admin": true,
  "role": "Some Role Name Here"
}
```

RESPONSE: (JSON)

```json
{
  "token": "<token>",
  "maps_api_key": "<maps_api_key>"
}
```

## Validate Credentials

This is just here to allow the UI to check if the username and password match, or if the user hasn't setup Two-factor Authentication, before asking for the code. The last 2 fields of the response are returned if the user has NOT setup 2FAuth.

`qrCodeUrl` is a link to a scannable QR code to be used with [Authy](https://authy.com/) or [Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en) to setup 2FAuth.

`secret2fa` is a string that can be copy/pasted to [Authy](https://authy.com/) or [Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en) to setup 2FAuth.

URL: `/validate`

METHOD: `POST`

PAYLOAD: (JSON)

```json
{
  "username": "pablom",
  "password": "superSecurePassword123$"
}
```

RESPONSE: (JSON)

```jsonc
{
  "username": "pablom",
  "needs2fa": false,
  "qrCodeUrl": "<qr_code_url>", // only provided if needs2fa is true
  "secret2fa": "<secret2fa>" // only provided if needs2fa is true
}
```

## Change Password

Allows a user to change his/her password. [You must be logged in to call this endpoint]()

URL: `/updatePassword`

METHOD: `POST`

PAYLOAD: (JSON)

```jsonc
{
  "password": "superSecurePassword123$"
  // Has to contain at least 1 of each: lowercase, uppercase, and number
}
```

RESPONSE: (JSON)

```json
{
  "message": "Successfully changed password!"
}
```

## Get Users

Gets all of the users that have been created so far. [You must be logged in to call this endpoint]()

URL: `/users`

METHOD: `GET`

RESPONSE: (JSON)

```json
[
  {
    "username": "pablom",
    "email": "pablom@fake.com",
    "admin": true,
    "role": "Some Role Name Here",
    "changePassword": false,
    "needs2fa": false
  }
]
```
