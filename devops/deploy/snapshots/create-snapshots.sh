#!/bin/bash

#update ./gcp/.env file with cluster that you want to creat snapshots from
gcloud auth activate-service-account $GCP_ACCOUNT --key-file=$GCP_KEY_FILE
gcloud container clusters get-credentials $GCP_CLUSTER --zone $GCP_ZONE --project $GCP_PROJECT
gcloud config set project $GCP_PROJECT

kubectl get pv --output custom-columns=NAME:.spec.gcePersistentDisk.pdName,CLAIM:.spec.claimRef.name --no-headers | while read -r line
do
	DISK_NAME=$(echo ${line} | cut -d' ' -f1)
	SNAPSHOT_NAME=$SNAPSHOT_PREFIX-$(echo ${line} | cut -d' ' -f2)-$SNAPSHOT_SUFFIX
	
	echo "Creating snapshot $SNAPSHOT_NAME for disk $DISK_NAME"

	gcloud compute disks snapshot $DISK_NAME --zone=$GCP_ZONE --snapshot-names=$SNAPSHOT_NAME --description="This is snapshot for kpmg-demo modern-delivery-demo disks"	
done
