#!/bin/bash
APIID=`aws appsync list-graphql-apis --query "graphqlApis[?name=='BookingAPI'].apiId"|jq -r .[0]`
aws appsync delete-graphql-api --api-id $APIID
COGNITOUSERPOOLID=`aws cognito-idp list-user-pools --max-results 50 --query "UserPools[?Name=='BookingUserPool'].Id"|jq -r .[0]`
AWS_ACCOUNT=`aws sts get-caller-identity | jq -r .Account`
AWS_REGION=${AWS_REGION:-eu-west-1}
aws cognito-idp delete-user-pool-domain --user-pool-id $COGNITOUSERPOOLID --domain $AWS_ACCOUNT
aws cognito-idp delete-user-pool --user-pool-id $COGNITOUSERPOOLID
