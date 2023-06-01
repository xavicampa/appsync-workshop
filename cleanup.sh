#!/bin/bash
export APIID=`aws appsync list-graphql-apis --query "graphqlApis[?name=='BookingAPI'].apiId"|jq -r .[0]`
aws appsync delete-graphql-api --api-id $APIID
export COGNITOUSERPOOLID=`aws cognito-idp list-user-pools --max-results 50 --query "UserPools[?Name=='BookingUserPool'].Id"|jq -r .[0]`
aws cognito-idp delete-user-pool --user-pool-id $COGNITOUSERPOOLID
