#/bin/bash

echo "Deleting database..."
aws rds delete-db-cluster --db-cluster-identifier hotelinventory-$1 --skip-final-snapshot --query DBCluster
aws rds wait db-cluster-deleted --db-cluster-identifier hotelinventory-$1

echo "Database deleted"
echo "Deleting secrets..."
aws secretsmanager delete-secret --secret-id /workshop/hotelinventory-db-manager-$1 --query Name --output text
aws secretsmanager delete-secret --secret-id /workshop/hotelinventory-db-roomview-$1 --query Name --output text
echo "Secrets deleted"
