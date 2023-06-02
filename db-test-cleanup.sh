#/bin/bash
echo Enter ID to delete resources:
read DELETEID

echo "Deleting secrets..."
aws secretsmanager delete-secret --secret-id /workshop/hotelinventory-db-manager-$DELETEID --query Name --output text
aws secretsmanager delete-secret --secret-id /workshop/hotelinventory-db-roomview-$DELETEID --query Name --output text
echo "Secrets deleted"

echo "Deleting database..."
aws rds delete-db-cluster --db-cluster-identifier hotelinventory-$DELETEID --skip-final-snapshot --query DBCluster.DBClusterIdentifier --output text

