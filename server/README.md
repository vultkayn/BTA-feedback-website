# Technical description of the provided REST API.

All following URI are to be prefixed by `/api` to be accessed from the client.
Any request from the end-user to an URI prefixed by `/api` is to be handled by the server, while any other are to be processed by the client.

*Authentification is no longer ensured by JWT but by a session*

## `/users`

### `POST`: Create a new user.

Require no special access. Fail if `univID` or `email` already exists in the DB.
Message encrypted.

**REQUEST**

```json
{
    "firstName": string,
    "lastName": string,
    "promo": int,
    "email": email,
    "univID": string,
    "password": string
}
```

**RESPONSE**

```json
200 http code if success
other if failure
```

### `PUT`: Update an existing user.
Concerned user must be authentified or it fails. `JWT` authentification here.

**REQUEST**

```json
{
    "univID": string,
}
```

**RESPONSE**

```json
200 http code if success
xxx http code if authentification failed.
yyy http code if any other failure
```

### `GET`: Retrieve a user record

**REQUEST**

```json
?univID: string | null
```
**RESPONSE**

```json
{
    "firstName": string,
    "lastName": string,
    "univID": string,
    "promo": int,
    "email": email
}
```

### `DELETE`: Delete the user.

```json
{
    "univID": string,
}
```

## `/connect`

### `POST`: Log in your account

**REQUEST**

```json
{
    "univID" : string,
    "password": string
}
```

**RESPONSE**

Create session

```json
{
    "univID": string,
}
```

## `/exercise` 

### `POST`: Create an exercise

**REQUEST**

```json
{
    "createdAt": date,
    "lastModifiedAt": date,
    "lastModifiedBy": univID,
    "title": string,
    "statement": string,
    "answerType": "Checkbox" | "Radio",
    "category": category,
    "auth": string
}
```

**RESPONSE**


```json
{
    "exerciseID": int | null
}
```

### `PUT`: Update an exercise

Requires user with elevated privileges. Check is done serverside depending on `auth`

**REQUEST**

```json
{
    "exerciseID": int,
    "editor": univID,
    "auth": string,
    "update": {
        "title": string,
        "statement": string,
        "answerType": "Checkbox" | "Radio",
        "category": category,
    }
}
```

**RESPONSE**

```json
{
    "exerciseID": int | null,
    "lastModifiedAt": date,
    "lastModifiedBy": univID
}
```

### `GET`: Get an exercise



### `DELETE`: