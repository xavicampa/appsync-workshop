# Introduction to secure GraphQL APIs (in AWS)
During this workshop, we’ll look into authentication, authorization and the integration with multiple backend data sources.

This repository contains template/boilerplate scripts and resources to be used during the workshop, including:
- Single Page Application
- GraphQL API
- User pool
- Booking NoSQL (DynamoDB) database
- Rooms SQL (Aurora Serverless) database
- Scripts and templates to get these running in the AWS public cloud

Requirements:
- AWS account
- Python 3.x to run single page application locally
- Postman

Optional:
- NodeJS to make changes, rebuild and run the Single Page Application locally

# Provisioning
The script might return some errors on the first run, as it tries to clean-up any leftovers from previous executions. It is safe to ignore errors during clean-up. Any errors from the "Provisioning" point should be reported.

NOTE: Consecutive executions of `provision.sh` will **reset** the environment back to the starting point! **Changes done in the AWS Console will be lost!**

## Option 1: from AWS CloudShell
1. Login into your AWS sandbox and open the CloudShell on the lower left corner.
2. Clone repository
```
git clone https://github.com/xavicampa/appsync-workshop.git
```
3. Execute `provision.sh`:

```bash
cd appsync-workshop
bash provision.sh

```
*Pay attention to any errors happening *after* the Provisioning message*

4. Copy the final output of the script into your notepad for later use

## Option 2: from local shell
This option assumes you have installed and configured your AWS default profile.

1. Clone repository
```
git clone https://github.com/xavicampa/appsync-workshop.git
```
2. Ensure that the `default` AWS profile is correctly set up and pointing to your AWS sandbox account *with region and output specified*

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
3. Execute `provision.sh`:

```bash
cd appsync-workshop
bash provision.sh

```
    - Pay attention to any errors happening *after* the Provisioning message

4. Copy the final output of the script into your notepad for later use

# Run web locally
## Option 1: using `python`
```bash
cd web
python -m http.server 3000
```

## Option 2: using `npm start` (requires NodeJS)
```bash
cd src
npm start
```
# First time login
Once the web is running locally, it should then be possible to visit [http://localhost:3000](http://localhost:3000) in your browser.

Login into the application using the `admin` and `person1` credentials (specified in the output of the `provision.sh` script above). You will be prompted to change password upon the first login of each identity. Use a password that you'll remember (or use a password manager), as you'll have to enter it when changing identities.

# Initial functionality
The user pool contains two groups, `admin` and `guest`, and two identities, `admin` and `person1`. `admin` user is member of the `admin` group, `person1` is member of the `guest`group.

Authorization is defined so that only `admin` members can manage bookings, having to specify guest, dates and room for the operations. `guest` members identities can only view.

Test the following:
- Listing rooms and bookins as `admin` and `person1` both work
- Adding a booking as admin succeeds
- Adding a booking as person1 fails
    - Error are reported in the Developer Console of your browser

# Requirement 1
Allow guest to add their own booking, without exposing guest as a parameter

## HOW
New mutation, guest auth, no guest parameter, use `$ctx.identity.sub` in resolver

### Test
- Adding a booking as guest succeeds

### Observe
- Updates are not visible without refresh
- Guest cannot remove bookings

# Requirement 2
Make guest bookings visible without refresh

## HOW
Add the new mutation to subscription

### Test
- Adding a booking as guest succeeds and appears without refresh

# Requirement 3
Allow guest to remove their own bookings, without exposing guest as parameter.

## HOW
New mutation, guest auth, no guest parameter, use $ctx.identity.sub for *authorization* in resolver.

### Test
- Removing guest booking works
- Removing admin booking does not work

### Observe
- Updates are not visible without refresh (fix by adding new mutation to subscription)

# Clean up
Execute `cleanup.sh`, provide the `Instance ID` returned by the `provision.sh` script when asked.
```bash
bash cleanup.sh
```
