#!/bin/bash
gcloud auth activate-service-account $GCP_ACCOUNT --key-file=$GCP_KEY_FILE

# this will create the default pool within the cluster
gcloud container clusters create $GCP_CLUSTER \
    --zone=$GCP_ZONE \
    --project=$GCP_PROJECT \
    --machine-type=n1-standard-8 \
    --disk-size=500 \
    --enable-autoscaling \
    --min-nodes=3 \
    --max-nodes=8

# this will add an additional pool for jenkins
gcloud container node-pools create jenkins-pool \
    --zone=$GCP_ZONE \
    --project=$GCP_PROJECT \
    --cluster=$GCP_CLUSTER \
    --machine-type=n1-standard-8 \
    --disk-size=500 \
    --num-nodes=1
