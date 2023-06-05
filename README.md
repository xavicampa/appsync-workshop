# Introduction to secure GraphQL APIs (in AWS)
This repository contains template/boilerplate scripts and resources to be used during the workshop.

Contents:
- Single Page Application
- GraphQL API
- Booking NoSQL (DynamoDB) table
- Rooms SQL (Aurora Serverless) database
- Scripts and templates to get these running in the AWS public cloud

During this workshop, we’ll look into authentication, authorization and the integration with multiple backend data sources.

You will need your own AWS-account and laptop to join.

Requirements:
- AWS account
- Postman
- Python 3.x to run single page application locally

Optional:
- NodeJS to make changes, rebuild and run the Single Page Application locally

## Provisioning
The script might return some errors on the first run, as it tries to clean-up any leftovers from previous executions. It is safe to ignore.

NOTE: Consecutive executions of `provision.sh` will **reset** the environment back to the starting point! **Changes done in the AWS Console will be lost!**.

### Option 1: from AWS CloudShell
1. Login into your AWS sandbox and open the CloudShell on the lower left corner.
2. Clone repository
3. Execute `provision.sh`:

```bash
bash provision.sh

```
4. Copy the final output of the script into your notepad for later use

## Option 2: from local shell
This option assumes you have installed and configured your AWS default profile.

1. Clone repository
2. Ensure that the `default` AWS profile is correctly set up pointing to your AWS sandbox account, with region and output specified

    - `.aws/credentials`
    ```
    [default]
    aws_access_key_id = AKIA***********
    aws_secret_access_key = *********************
    ```

    - `.aws/config`
    ```
    [profile default]
    region = eu-west-1
    output = json
    ```
3. Execute `provision.sh`:

```bash
bash provision.sh

```
4. Copy the final output of the script into your notepad for later use

## Start Single Page Application locally
```bash
cd web
python -m http.server 3000
```
It should then be possible to visit [http://localhost:3000](http://localhost:3000) in your browser.

## Starting point
The user pool contains two groups, `admin` and `guest`, and two identities, `admin` and `person1`. `admin` user is member of the `admin` group, `person1` is member of the `guest`group.

Authorization is defined in the GraphQL schema, and it's set so that only admin can manage bookings, having to specify guest, dates and room for the operations. Guests can only view.

Test:
- Listing rooms and bookins as `admin` and `person1` both work
- Adding a booking as admin succeeds
- Adding a booking as person1 fails

## CHANGE 1
Allow guest to add their own booking, without exposing guest as a parameter.

HOW: new mutation, guest auth, no guest parameter, use $ctx.identity.sub in resolver.

Test:
- Adding a booking as guest succeeds.

Observe:
- Updates are not visible without refresh
- Guest cannot remove bookings

## CHANGE 2
Make guest bookings visible without refresh.

HOW: add new mutation to subscription.

Test:
- Adding a booking as guest succeeds and appears without refresh.

## CHANGE 3
Allow guest to remove their own bookings, without exposing guest as parameter.

HOW: new mutation, guest auth, no guest parameter, use $ctx.identity.sub for *authorization* in resolver.

Test:
- Removing guest booking works
- Removing admin booking does not work

Observe:
- Updates are not visible without refresh (fix by adding new mutation to subscription)

## Clean up
Execute `cleanup.sh`:
```bash
bash cleanup.sh

```
