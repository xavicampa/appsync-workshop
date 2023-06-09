# Introduction to secure GraphQL APIs (in AWS)
During this workshop, we’ll look into authentication, authorization and the integration with multiple backend data sources.

This repository contains template/boilerplate scripts and resources to be used during the workshop, including:
- Web (React 18 single-page-app)
- GraphQL API (AWS AppSync)
- User pool (Amazon Cognito)
- Booking NoSQL (Amazon DynamoDB) database
- Rooms SQL (Amazon Aurora Serverless) database
- Scripts and templates to get these running in the AWS public cloud

Requirements:
- AWS account
- [Python 3.x](https://www.python.org/downloads/) to serve the web locally
- [Postman](https://www.postman.com/downloads/) to issue API requests directly

Optional:
- [NodeJS](https://nodejs.org/en) to make changes and rebuild the web
- jq (if running `provision.sh` locally)

# Provisioning
The script might return some errors on the first run, as it tries to clean up any leftovers from previous executions. It is safe to ignore errors during clean-up. Any errors from the "Provisioning" point should be reported.

NOTE: Consecutive executions of `provision.sh` will **reset** the environment back to the starting point! **Changes done in the AWS Console will be lost!**

## Option 1: from AWS CloudShell
1. Login into your AWS sandbox
2. Select the `Europe (Ireland) - eu-west-1` region on the top right corner
3. Open the CloudShell on the lower left corner.
4. Clone repository
```
git clone https://github.com/xavicampa/appsync-workshop.git
```
5. Execute `provision.sh`. Empty `Instance ID` on the first run is fine, simply press Enter:

```bash
cd appsync-workshop
bash provision.sh

```
Errors are expected on the first run, as it tries to clean up leftovers from pervious executions. *Pay attention to any errors happening *after* the Provisioning message*

6. Copy the final output of the script into your notepad for later use

## Option 2: from local shell
This option assumes you have installed and configured the [aws-cli](https://aws.amazon.com/cli/) with a `default` AWS profile.

1. Clone repository
```
git clone https://github.com/xavicampa/appsync-workshop.git
```
2. Ensure that the `default` AWS profile is correctly set up with credentials from your AWS sandbox account _with region and output specified_
    - __Make sure that your default profile DOES NOT point to a customer AWS account!__

    - `.aws/credentials`
    ```
    [default]
    aws_access_key_id = *****************
    aws_secret_access_key = *********************
    ```

    - `.aws/config`
    ```
    [profile default]
    region = eu-west-1
    output = json
    ```
3. Execute `provision.sh`. Empty `Instance ID` on the first run is fine, simply press Enter:

```bash
cd appsync-workshop
bash provision.sh

```
Errors are expected on the first run, as it tries to clean up leftovers from pervious executions. *Pay attention to any errors happening *after* the Provisioning message*

4. Copy the final output of the script into your notepad for later use

# Run web locally
The file `aws-exports.js` is primed during the execution of `provision.sh` with pointers to the resources provisioned in your AWS account:

- If the script has run in the CloudShell (Option 1 above), you need to clone the repository locally in your machine and make sure to copy&paste the content of `web/aws-exports.js` from the CloudShell to your local `web/aws-exports.js` file
- If the script has run from a local shell (Option 2 above), there's nothing to do 

## Option 1: serve web locally using `python`
```bash
cd web
python -m http.server 3000
```

## Option 2: run web locally using `npm start`. Requires NodeJS
```bash
cd src
npm install
npm start
```

# First time login
Once the web is running locally, it should then be possible to visit [http://localhost:3000](http://localhost:3000) in your browser.

Login into the application using the `admin`, `person1` and `person2` credentials (specified in the output of the `provision.sh` script above). You will be prompted to change password upon the first login of each identity. Use a password that you'll remember (or use a password manager), as you'll have to enter it when changing identities.

# Postman
Open Postman and import the collection `postman/GraphQLWorkshop.postman_collection.json`. There are two collection variables to be set

- _URL_: GraphQL API URL taken from the output of `provision.sh`
- _Authorization_: copy the `XXXXX.accessToken` variable from the `Session storage` of the browser after login. This variable needs to be updated when switching between `admin`, `person1` and `person2` identities, as the token is unique per identity and session

Remember to save the variables.

*This `Authorization` blob is actually a JWT token. To inspect the contents, go to [jwt.io](https://jwt.io) and simply paste the JWT token in the left panel, the contents will then show up on the right panel. You'll see, among other fields, your unique user identifier, or _subject_, in the `sub` claim. We'll use this in the exercises below.*


# Initial functionality
The user pool contains two groups, `admin` and `guest`, and three identities, `admin`, `person1` and `person2`. `admin` user is member of the `admin` group, `person1` is member of the `guest` group, `person2` does not belong to any groups.

Authorization is defined so that only `admin` members can manage bookings, having to specify guest, dates and room for the operations. `guest` members identities can only view. Users without memberships cannot access any operations.

Test the following:
- Listing rooms and bookings as `admin` and `person1` both work
- Listing rooms and bookings as `person2` does *not* work
    - Inspect Network tab in your browser's developer tool to check for the API error
    - Error might be reported only in the browser's Developer Console
- Adding a booking as `admin` succeeds
- Adding a booking as `person1` fails
    - Inspect Network tab in your browser's developer tool to check for the API error
    - Error might be reported only in the browser's Developer Console

# Exercises
The following sections describe new requirements for the API. Use the AWS Console to make the required adjustments, remembering to apply/save your changes. Be aware of the eventual consistency characteristics of AWS, changes might take a few seconds to be effective.

## Requirement 1
Limit access to the `guest` field from the `Booking` type to `admin` members.

### HOW
1. In the AWS Console, go to the AWS AppSync service, select BookingAPI and Schema
2. Modify the schema adding `@aws_auth` to the `guest` field in the `Booking` type, it should only contain the `admin` cognito group
3. Save the schema

#### Test
- running listBookings as `admin` succeeds when querying for `guest` field
- running listBookings as `person1` fails when querying for `guest` field

#### Observe
- Inspect the GraphQL response, what's in `data` and `error` fields

## Requirement 2
Allow guest to add their own booking, without exposing guest as a parameter

### HOW
1. In the AWS Console, go to the AWS AppSync service, select BookingAPI and Schema
2. Modify the schema to add a new mutation, similar to addBooking, with guest cognito group authorization, without guest parameter
3. Save the schema
4. Attach a new resolver to the new mutation from the panel on the right
5. Select Update runtime and specify a Unit resolver (VTL)
6. Copy the mapping templates from the addBooking mutation, but use `$ctx.identity.sub` as guest key, and save

#### Test
- Adding a booking as guest succeeds

#### Observe
- Updates are not visible at once, one has to exit Bookings (Home, or Rooms) and load again Bookings
- Guest cannot remove bookings

## Requirement 3
Make guest bookings visible without refresh

### HOW
1. Modify the schema by adding the new mutation to the list of mutations that trigger the existing subscription

#### Test
- Adding a booking as guest succeeds and appears without refresh

## Requirement 4
Allow guest to remove their own bookings, without exposing guest as parameter.

### HOW
Summary: New mutation, guest auth, no guest parameter, use $ctx.identity.sub for *authorization* in resolver.

#### Test
- Removing guest booking works
- Removing admin booking does not work

#### Observe
- Updates are not visible without refresh (fix by adding new mutation to subscription)

## Requirement 5
Display room price (per day) of bookings without issuing extra API calls.

_OPTIONAL: modify frontend to display the new field. Requires NodeJS._

### HOW
Add `room` field to `Booking` type of type `Room`, add resolver and mapping template

#### Test
- listBookings accepts `room` field and can return its `price`

#### Observe
- The new field requires `@aws_auth` to be added

## Requirement 6
Display bookings when listing rooms without issuing extra API calls.

_OPTIONAL: modify frontend to display booking information the room list. Requires NodeJS._

### HOW
Add `bookings` field to `Room` type of type `Booking[]`, add resolver and mapping template

#### Test
- listRooms accepts `bookings` field and can return its properties

#### Observe
- The new field requires `@aws_auth` to be added

## Requirement 7
Add filtering, so that `listBookings` can filter results by `guest` and `roomid`.

# Clean up
Execute `cleanup.sh`, provide the `Instance ID` returned by the `provision.sh` script when asked.
```bash
bash cleanup.sh
```
