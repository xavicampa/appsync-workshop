#!/bin/bash

echo "Creating db-secrets"
DBPASSWORD=`aws secretsmanager get-random-password  --password-length 16 --query RandomPassword --exclude-punctuation --output text`
DBPASSWORDARN=`aws secretsmanager create-secret --name /workshop/hotelinventory-db-manager-$1 --secret-string '{"password": "'$DBPASSWORD'","username": "manager"}' --query ARN --output text`
DBPASSWORDREADER=`aws secretsmanager get-random-password  --password-length 16 --query RandomPassword --exclude-punctuation --output text`
DBPASSWORDREADERARN=`aws secretsmanager create-secret --name /workshop/hotelinventory-db-roomview-$1 --secret-string '{"password": "'$DBPASSWORDREADER'","username": "roomview"}' --query ARN --output text`


echo "Creating database cluster"
DBCLUSTERARN=`aws rds create-db-cluster --db-cluster-identifier hotelinventory-$1 --enable-http-endpoint \
--master-username manager --master-user-password $DBPASSWORD --engine aurora-mysql --engine-mode serverless --engine-version 5.7.2 \
--scaling-configuration MinCapacity=1,MaxCapacity=4,AutoPause=true,SecondsUntilAutoPause=300 --query DBCluster.DBClusterArn --output text` || exit

aws rds wait db-cluster-available --db-cluster-identifier hotelinventory-$1 > /dev/null
echo "Database cluster created"

aws rds-data execute-statement --resource-arn $DBCLUSTERARN --secret-arn $DBPASSWORDARN --sql "CREATE USER 'roomview'@'%' IDENTIFIED BY '$DBPASSWORDREADER';"
echo "User created, populating data"
while read p; do
 aws rds-data execute-statement --resource-arn $DBCLUSTERARN --secret-arn $DBPASSWORDARN --sql "$p" > /dev/null
 echo -n "."
done <mysql.sql
echo "Data populated"


echo "NOTE!!!"
echo "Refrence for secrets manager for admin:"
echo $DBPASSWORDARN
echo "Refrence for secrets manager for readonly (API):"
echo $DBPASSWORDREADERARN

