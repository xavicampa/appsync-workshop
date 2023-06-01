#!/bin/bash
# clean-up
bash cleanup.sh

# Cognito userpool
export COGNITOUSERPOOLID=`aws cognito-idp create-user-pool --pool-name BookingUserPool | jq -r .UserPool.Id`

# Cognito web client
export WEBCLIENTID=`aws cognito-idp create-user-pool-client \
    --user-pool-id $COGNITOUSERPOOLID \
    --callback-url http://localhost:3000/signIn \
    --client-name web | jq -r .UserPoolClient.ClientId`

# Cognito users
aws cognito-idp admin-create-user \
    --user-pool-id $COGNITOUSERPOOLID \
    --username admin \
    --temporary-password Admin1234! \
    --no-cli-pager
aws cognito-idp admin-create-user \
    --user-pool-id $COGNITOUSERPOOLID \
    --username guest \
    --temporary-password Guest1234! \
    --no-cli-pager

# Cognito groups
aws cognito-idp create-group \
    --user-pool-id $COGNITOUSERPOOLID \
    --group-name admin \
    --no-cli-pager
aws cognito-idp create-group \
    --user-pool-id $COGNITOUSERPOOLID \
    --group-name guest \
    --no-cli-pager
aws cognito-idp admin-add-user-to-group \
    --user-pool-id $COGNITOUSERPOOLID \
    --username admin \
    --group-name admin \
    --no-cli-pager
aws cognito-idp admin-add-user-to-group \
    --user-pool-id $COGNITOUSERPOOLID \
    --username guest \
    --group-name guest \
    --no-cli-pager

# AppSync API
AWS_REGION=${AWS_REGION:-eu-west-1}
export APIID=`aws appsync create-graphql-api \
    --name BookingAPI \
    --authentication-type AMAZON_COGNITO_USER_POOLS \
    --user-pool-config userPoolId=$COGNITOUSERPOOLID,awsRegion=$AWS_REGION,defaultAction=DENY \
    --no-cli-pager | jq -r .graphqlApi.apiId`
aws appsync start-schema-creation \
    --api-id $APIID \
    --definition `base64 < schema.graphql` \
    --no-cli-pager

# Prime Web config
export GRAPHQLAPIURL=`aws appsync get-graphql-api --api-id $APIID|jq -r .graphqlApi.uris.GRAPHQL`
sed "s|%GRAPHQLAPIURL%|$GRAPHQLAPIURL|g;s|%USERPOOLID%|$COGNITOUSERPOOLID|g;s|%WEBCLIENTID%|$WEBCLIENTID|g" < aws-exports.js > web/aws-exports.js
cp web/aws-exports.js src/public/aws-exports.js

clear
echo Cognito UserPool Id: $COGNITOUSERPOOLID
echo Web Client: $WEBCLIENTID
echo GraphQL API URL: $GRAPHQLAPIURL
echo Admin web credential: admin:Admin1234!
echo Guest web credential: guest:Guest1234!
