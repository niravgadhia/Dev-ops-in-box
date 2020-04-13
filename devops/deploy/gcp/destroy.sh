#!/bin/bash

# Set up auth
gcloud auth activate-service-account $GCP_ACCOUNT --key-file=$GCP_KEY_FILE

# Remove cluster and both node pools (default pool and jenkins pool)
gcloud container clusters delete $GCP_CLUSTER \
  --zone=$GCP_ZONE \
  --project=$GCP_PROJECT

# Get the names of disks associated with the now removed cluster. Most disks are named using the
# convention "<image name>-<cluster name>", but some are generated and are similar to
# "gke-<cluster name>-<pool name>-<generated id>". To match all disks a regular expression matches
# for the cluster name anywhere in the disk name followed by a dash (-) or at the end of a line.
echo "\nFinding disks associated to $GCP_CLUSTER cluster"
disk_names=$(gcloud compute disks list --project=$GCP_PROJECT --filter="zone:$GCP_ZONE AND (name~$GCP_CLUSTER- OR name~$GCP_CLUSTER$)" --format="value(name)")

# Remove disks created for the cluster
for disk in $disk_names
do
  echo "\nDeleting disk $disk"
  gcloud compute disks delete $disk \
    --zone=$GCP_ZONE \
    --project=$GCP_PROJECT \
    --quiet
done
