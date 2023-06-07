#!/bin/bash

# clean-up
bash cleanup.sh

echo " "
echo "============"
echo "Provisioning"
echo "============"
echo " "
echo "ATTENTION: Errors from this point should be reported!"
echo " "

#  MAKING DB-environment 1

echo "Creating db-secrets"
DBPASSWORD=`aws secretsmanager get-random-password  --password-length 16 --query RandomPassword --exclude-punctuation --output text`
DBPASSWORDARN=`aws secretsmanager create-secret --name /workshop/hotelinventory-db-manager-$$ --secret-string '{"password": "'$DBPASSWORD'","username": "manager"}' --query ARN --output text`
DBPASSWORDREADER=`aws secretsmanager get-random-password  --password-length 16 --query RandomPassword --exclude-punctuation --output text`
DBPASSWORDREADERARN=`aws secretsmanager create-secret --name /workshop/hotelinventory-db-roomview-$$ --secret-string '{"password": "'$DBPASSWORDREADER'","username": "roomview"}' --query ARN --output text`


echo "Creating database cluster"
DBCLUSTERARN=`aws rds create-db-cluster \
    --db-cluster-identifier hotelinventory-$$ \
    --enable-http-endpoint \
    --master-username manager \
    --master-user-password $DBPASSWORD \
    --engine aurora-mysql \
    --engine-mode serverless \
    --engine-version 5.7.2 \
    --scaling-configuration MinCapacity=1,MaxCapacity=4,AutoPause=true,SecondsUntilAutoPause=3600 \
    --query DBCluster.DBClusterArn \
    --output text` || exit

# aws cloudformation create-stack \
#     --stack-name "appsyncworkshop" \
#     --template-body file://setup/cloudformation.yaml  \
#     --capabilities CAPABILITY_NAMED_IAM \
#     --no-cli-pager

echo "Creating user pool"
# Cognito userpool
COGNITOUSERPOOLID=`aws cognito-idp create-user-pool \
    --pool-name BookingUserPool \
    --output json | jq -r .UserPool.Id`

# Cognito domain (to expose HostedUI)
AWS_ACCOUNT=`aws sts get-caller-identity | jq -r .Account`
COGNITODOMAIN=`aws cognito-idp create-user-pool-domain \
    --domain $AWS_ACCOUNT \
    --user-pool-id $COGNITOUSERPOOLID \
    --output json | jq -r .UserPoolDomain`

# Cognito web client
WEBCLIENTID=`aws cognito-idp create-user-pool-client \
    --user-pool-id $COGNITOUSERPOOLID \
    --callback-urls http://localhost:3000/ \
    --logout-urls http://localhost:3000/ \
    --supported-identity-providers COGNITO \
    --allowed-o-auth-flows-user-pool-client \
    --allowed-o-auth-flows code \
    --allowed-o-auth-scopes openid profile aws.cognito.signin.user.admin \
    --client-name web \
    --output json | jq -r .UserPoolClient.ClientId`

# Cognito users
aws cognito-idp admin-create-user \
    --user-pool-id $COGNITOUSERPOOLID \
    --username admin \
    --temporary-password Admin1234! \
    --no-cli-pager
aws cognito-idp admin-create-user \
    --user-pool-id $COGNITOUSERPOOLID \
    --username person1 \
    --temporary-password Guest1234! \
    --no-cli-pager
aws cognito-idp admin-create-user \
    --user-pool-id $COGNITOUSERPOOLID \
    --username person2 \
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
    --username person1 \
    --group-name guest \
    --no-cli-pager

# AppSync API
echo "Creating GraphQL API"
AWS_REGION=${AWS_REGION:-eu-west-1}
APIID=`aws appsync create-graphql-api \
    --name BookingAPI \
    --authentication-type AWS_IAM \
    --additional-authentication-providers authenticationType=AMAZON_COGNITO_USER_POOLS,userPoolConfig=\{userPoolId=$COGNITOUSERPOOLID,awsRegion=$AWS_REGION\} \
    --output json \
    --no-cli-pager | jq -r .graphqlApi.apiId` 
aws appsync start-schema-creation \
    --api-id $APIID \
    --definition "`base64 < setup/schema.graphql`" \
    --no-cli-pager

# Prime Web config
GRAPHQLAPIURL=`aws appsync get-graphql-api --api-id $APIID --output json | jq -r .graphqlApi.uris.GRAPHQL`
sed "s|%AWS_REGION%|$AWS_REGION|g;s|%GRAPHQLAPIURL%|$GRAPHQLAPIURL|g;s|%USERPOOLID%|$COGNITOUSERPOOLID|g;s|%WEBCLIENTID%|$WEBCLIENTID|g;s|%COGNITODOMAIN%|$AWS_ACCOUNT.auth.$AWS_REGION.amazoncognito.com|g" < setup/aws-exports.js > web/aws-exports.js
cp web/aws-exports.js src/public/aws-exports.js

# DynamoDB
echo "Creating Bookings table"
aws dynamodb create-table \
    --table-name Bookings \
    --attribute-definitions AttributeName=guest,AttributeType=S AttributeName=id,AttributeType=S \
    --key-schema AttributeName=guest,KeyType=HASH AttributeName=id,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --no-cli-pager 

# Data sources and resolvers
echo "Creating Bookings data source and resolvers"
APPSYNC_ROLE_ARN=`aws iam create-role \
    --role-name appsync-workshop-appsync-dynamodb-role \
    --assume-role-policy-document file://setup/appsync/role-assume-policy.json \
    --output json \
    --no-cli-pager | jq -r .Role.Arn`
aws iam put-role-policy \
    --role-name appsync-workshop-appsync-dynamodb-role \
    --policy-name Permissions-Policy-For-AppSync \
    --policy-document "`sed "s|%AWS_REGION%|$AWS_REGION|g;s|%AWS_ACCOUNT%|$AWS_ACCOUNT|g" < setup/appsync/role-policy.json`" \
    --no-cli-pager
aws appsync create-data-source \
    --api-id $APIID \
    --name BookingsDataSource \
    --type AMAZON_DYNAMODB \
    --dynamodb-config tableName=Bookings,awsRegion=$AWS_REGION,useCallerCredentials=FALSE,versioned=FALSE \
    --service-role-arn $APPSYNC_ROLE_ARN \
    --no-cli-pager
aws appsync create-resolver \
    --field-name listBookings \
    --type-name Query \
    --api-id $APIID \
    --data-source-name BookingsDataSource \
    --request-mapping-template "`cat setup/appsync/resolvers/listBookings-req.vtl`" \
    --response-mapping-template "`cat setup/appsync/resolvers/listBookings-resp.vtl`" \
    --no-cli-pager
aws appsync create-resolver \
    --field-name addBooking \
    --type-name Mutation \
    --api-id $APIID \
    --data-source-name BookingsDataSource \
    --request-mapping-template "`cat setup/appsync/resolvers/addBooking-req.vtl`" \
    --response-mapping-template "`cat setup/appsync/resolvers/addBooking-resp.vtl`" \
    --no-cli-pager
aws appsync create-resolver \
    --field-name removeBooking \
    --type-name Mutation \
    --api-id $APIID \
    --data-source-name BookingsDataSource \
    --request-mapping-template "`cat setup/appsync/resolvers/removeBooking-req.vtl`" \
    --response-mapping-template "`cat setup/appsync/resolvers/removeBooking-resp.vtl`" \
    --no-cli-pager

# Wait for CFN to be COMPLETE
# aws cloudformation wait stack-create-complete \
#     --stack-name "appsyncworkshop" \
#     --no-cli-pager

#  MAKING DB-environment 2

echo "Waiting for database"
aws rds wait db-cluster-available --db-cluster-identifier hotelinventory-$$ > /dev/null
echo "Database cluster created"

aws rds-data execute-statement --resource-arn $DBCLUSTERARN --secret-arn $DBPASSWORDARN --sql "CREATE USER 'roomview'@'%' IDENTIFIED BY '$DBPASSWORDREADER';" > /dev/null
echo "User created, populating data"
while read p; do
 aws rds-data execute-statement --resource-arn $DBCLUSTERARN --secret-arn $DBPASSWORDARN --sql "$p" > /dev/null
 echo -n "."
done <setup/mysql.sql
echo "Data populated"


# SQL datasource and resolvers
aws appsync create-data-source \
    --name RoomsDataSource \
    --api-id $APIID \
    --type RELATIONAL_DATABASE \
    --relational-database-config '{"relationalDatabaseSourceType":"RDS_HTTP_ENDPOINT","rdsHttpEndpointConfig":{"awsRegion":"eu-west-1","dbClusterIdentifier":"'$DBCLUSTERARN'","databaseName":"hotelinventory","schema":"hotelinventory","awsSecretStoreArn":"'$DBPASSWORDREADERARN'"}}' \
    --service-role $APPSYNC_ROLE_ARN \
    --no-cli-pager
aws appsync create-resolver \
    --field-name listRooms \
    --type-name Query \
    --api-id $APIID \
    --data-source-name RoomsDataSource \
    --request-mapping-template "`cat setup/appsync/resolvers/listRooms-req.vtl`" \
    --response-mapping-template "`cat setup/appsync/resolvers/listRooms-resp.vtl`" \
    --no-cli-pager

echo " "
echo "=====COPY CONTENT BELOW======"
echo Instance ID when deleting later: $$
echo " "
echo Cognito UserPool Id: $COGNITOUSERPOOLID
echo Web Client: $WEBCLIENTID
echo GraphQL API URL: $GRAPHQLAPIURL
echo Admin web credential: admin:Admin1234!
echo Guest web credential: person1:Guest1234!
echo Not-member web credential: person2:Guest1234!
echo " "
echo "Refrence for secrets manager for DB-admin:"
echo $DBPASSWORDARN
echo " "
echo "Refrence for secrets manager for DB-readonly (API):"
echo $DBPASSWORDREADERARN
echo "=====COPY CONTENT ABOVE======"
