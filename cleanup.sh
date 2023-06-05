#!/bin/bash

read -p "Enter ID to delete resources: " DELETEID

echo " "
echo "==============="
echo "Cleaning up"
echo "==============="
echo " "

echo "Deleting API..."
APIID=`aws appsync list-graphql-apis --query "graphqlApis[?name=='BookingAPI'].apiId"|jq -r .[0]`
aws appsync delete-graphql-api --api-id $APIID

echo "Deleting Bookings table..."
aws dynamodb delete-table --table-name Bookings --no-cli-pager
aws iam delete-role-policy \
    --role-name appsync-workshop-appsync-dynamodb-role \
    --policy-name Permissions-Policy-For-AppSync
aws iam delete-role --role-name appsync-workshop-appsync-dynamodb-role --no-cli-pager

echo "Deleting user pool..."
COGNITOUSERPOOLID=`aws cognito-idp list-user-pools --max-results 50 --query "UserPools[?Name=='BookingUserPool'].Id"|jq -r .[0]`
AWS_ACCOUNT=`aws sts get-caller-identity | jq -r .Account`
AWS_REGION=${AWS_REGION:-eu-west-1}
aws cognito-idp delete-user-pool-domain --user-pool-id $COGNITOUSERPOOLID --domain $AWS_ACCOUNT
aws cognito-idp delete-user-pool --user-pool-id $COGNITOUSERPOOLID

echo "Deleting secrets..."
aws secretsmanager delete-secret \
    --secret-id /workshop/hotelinventory-db-manager-$DELETEID \
    --query Name \
    --output text \
    --no-cli-pager
aws secretsmanager delete-secret \
    --secret-id /workshop/hotelinventory-db-roomview-$DELETEID \
    --query Name \
    --output text \
    --no-cli-pager
echo "Secrets deleted"

# aws cloudformation delete-stack \
#     --stack-name appsyncworkshop \
#     --no-cli-pager

echo "Deleting database..."
aws rds delete-db-cluster \
    --db-cluster-identifier hotelinventory-$DELETEID \
    --skip-final-snapshot \
    --query DBCluster.DBClusterIdentifier \
    --output text \
    --no-cli-pager
