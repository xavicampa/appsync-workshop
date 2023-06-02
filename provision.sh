#!/bin/bash
# clean-up
bash cleanup.sh

# Cognito userpool
COGNITOUSERPOOLID=`aws cognito-idp create-user-pool --pool-name BookingUserPool | jq -r .UserPool.Id`

# Cognito domain (to expose HostedUI)
AWS_ACCOUNT=`aws sts get-caller-identity | jq -r .Account`
COGNITODOMAIN=`aws cognito-idp create-user-pool-domain \
    --domain $AWS_ACCOUNT \
    --user-pool-id $COGNITOUSERPOOLID | jq -r .UserPoolDomain`

# Cognito web client
WEBCLIENTID=`aws cognito-idp create-user-pool-client \
    --user-pool-id $COGNITOUSERPOOLID \
    --callback-urls http://localhost:3000/ \
    --logout-urls http://localhost:3000/ \
    --supported-identity-providers COGNITO \
    --allowed-o-auth-flows-user-pool-client \
    --allowed-o-auth-flows code \
    --allowed-o-auth-scopes openid profile aws.cognito.signin.user.admin \
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
APIID=`aws appsync create-graphql-api \
    --name BookingAPI \
    --authentication-type AMAZON_COGNITO_USER_POOLS \
    --user-pool-config userPoolId=$COGNITOUSERPOOLID,awsRegion=$AWS_REGION,defaultAction=DENY \
    --no-cli-pager | jq -r .graphqlApi.apiId` 
aws appsync start-schema-creation \
    --api-id $APIID \
    --definition "`base64 < schema.graphql`" \
    --no-cli-pager

# Prime Web config
GRAPHQLAPIURL=`aws appsync get-graphql-api --api-id $APIID|jq -r .graphqlApi.uris.GRAPHQL`
sed "s|%AWS_REGION%|$AWS_REGION|g;s|%GRAPHQLAPIURL%|$GRAPHQLAPIURL|g;s|%USERPOOLID%|$COGNITOUSERPOOLID|g;s|%WEBCLIENTID%|$WEBCLIENTID|g;s|%COGNITODOMAIN%|$AWS_ACCOUNT.auth.$AWS_REGION.amazoncognito.com|g" < aws-exports.js > web/aws-exports.js
cp web/aws-exports.js src/public/aws-exports.js


#  MAKING DB-environment

echo "Creating db-secrets"
DBPASSWORD=`aws secretsmanager get-random-password  --password-length 16 --query RandomPassword --exclude-punctuation --output text`
DBPASSWORDARN=`aws secretsmanager create-secret --name /workshop/hotelinventory-db-manager-$$ --secret-string '{"password": "'$DBPASSWORD'","username": "manager"}' --query ARN --output text`
DBPASSWORDREADER=`aws secretsmanager get-random-password  --password-length 16 --query RandomPassword --exclude-punctuation --output text`
DBPASSWORDREADERARN=`aws secretsmanager create-secret --name /workshop/hotelinventory-db-roomview-$$ --secret-string '{"password": "'$DBPASSWORDREADER'","username": "roomview"}' --query ARN --output text`


echo "Creating database cluster"
DBCLUSTERARN=`aws rds create-db-cluster --db-cluster-identifier hotelinventory-$$ --enable-http-endpoint \
--master-username manager --master-user-password $DBPASSWORD --engine aurora-mysql --engine-mode serverless --engine-version 5.7.2 \
--scaling-configuration MinCapacity=1,MaxCapacity=4,AutoPause=true,SecondsUntilAutoPause=300 --query DBCluster.DBClusterArn --output text` || exit

aws rds wait db-cluster-available --db-cluster-identifier hotelinventory-$$ > /dev/null
echo "Database cluster created"

aws rds-data execute-statement --resource-arn $DBCLUSTERARN --secret-arn $DBPASSWORDARN --sql "CREATE USER 'roomview'@'%' IDENTIFIED BY '$DBPASSWORDREADER';" > /dev/null
echo "User created, populating data"
while read p; do
 aws rds-data execute-statement --resource-arn $DBCLUSTERARN --secret-arn $DBPASSWORDARN --sql "$p" > /dev/null
 echo -n "."
done <mysql.sql
echo "Data populated"

#
# TODO - create role and link
#
#aws appsync create-data-source --name workshop-$$ --api-id $APIID --type RELATIONAL_DATABASE \
#--relational-database-config '{"relationalDatabaseSourceType":"RDS_HTTP_ENDPOINT","rdsHttpEndpointConfig":{"awsRegion":"eu-west-1","dbClusterIdentifier":"'$DBCLUSTERARN'","databaseName":"hotelinventory","schema":"hotelinventory","awsSecretStoreArn":"'$DBPASSWORDREADERARN'"}}' \
#--service-role arn:aws:iam::699052885502:role/service-role/appsync-ds-rds-xz9NX2eNFbZO-cluster-2


echo " "
echo "==========================="
echo " "
echo Cognito UserPool Id: $COGNITOUSERPOOLID
echo Web Client: $WEBCLIENTID
echo GraphQL API URL: $GRAPHQLAPIURL
echo Admin web credential: admin:Admin1234!
echo Guest web credential: guest:Guest1234!
echo Instance ID when deleting later: $$
echo " "
echo "Refrence for secrets manager for DB-admin:"
echo $DBPASSWORDARN
echo " "
echo "Refrence for secrets manager for DB-readonly (API):"
echo $DBPASSWORDREADERARN
echo "==========================="
