#!/bin/bash

gcloud auth activate-service-account $GCP_ACCOUNT --key-file=$GCP_KEY_FILE
gcloud container clusters get-credentials $GCP_CLUSTER --zone $GCP_ZONE --project $GCP_PROJECT

#sleep for 10 seconds so k8s can create the files before we try to modify it
sleep 10

echo "WARNING: updating persistant volumes claim to use existing pv"
for VOLUMECLAIM in $(find /workspace/deploy/k8s/*-persistentvolumeclaim.yaml -type f)
do
	FILENAME=${VOLUMECLAIM##*/}
	VOLUME=${FILENAME%-persistentvolumeclaim.yaml}
	
	sed -i \
      -e "s/spec:/spec:\n  volumeName: ${VOLUME}\n  storageClassName: standard/g" \
      $VOLUMECLAIM	    

done

#this commands deploy persistance volume and services
kubectl apply -f /workspace/deploy/k8s