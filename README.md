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
1. Clone repository
2. Execute `provision.sh`:

```bash
bash provision.sh

```
The script might return some errors on the first run, as it tries to clean-up any leftovers from previous executions. It is safe to ignore.

NOTE: Consecutive executions of `provision.sh` will **reset** the environment back to the starting point! **Changes done in the AWS Console will be lost!**.

## Start Single Page Application locally
```bash
cd web
python -m http.server 3000
```
It should then be possible to visit [http://localhost:3000](http://localhost:3000) in your browser.

## Starting point
Only admin can add booking by specifying guest, dates and room.

Test:
- Adding a booking as guest fails

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
