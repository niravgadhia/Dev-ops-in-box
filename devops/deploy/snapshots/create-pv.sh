#!/bin/bash

gcloud config set project $GCP_PROJECT
gcloud auth activate-service-account $GCP_ACCOUNT --key-file=$GCP_KEY_FILE
gcloud container clusters get-credentials $GCP_CLUSTER --zone $GCP_ZONE --project $GCP_PROJECT

rm -rf /workspace/deploy/k8s/pv/*.yaml

#sleep for 10 seconds so k8s can create the files before we try to modify it
sleep 10

echo "WARNING: creating persistant volumes using snapshots"
for VOLUMECLAIM in $(find /workspace/deploy/k8s/*-persistentvolumeclaim.yaml -type f)
do
	FILENAME=${VOLUMECLAIM##*/}
	VOLUME=${FILENAME%-persistentvolumeclaim.yaml}
  DISK_NAME=${VOLUME}-${GCP_CLUSTER}
  SNAPSHOT_NAME=${SNAPSHOT_PREFIX}-${VOLUME}-${SNAPSHOT_SUFFIX}
  SIZE=10

	gcloud compute disks create $DISK_NAME --size=${SIZE}GB --zone=$GCP_ZONE --source-snapshot=$SNAPSHOT_NAME
                   
  cat <<EOF >/workspace/deploy/k8s/pv/${VOLUME}-persistentvolume.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: ${VOLUME}
spec:
  capacity:
    storage: ${SIZE}Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  gcePersistentDisk:
    pdName: ${DISK_NAME}
    fsType: ext4
EOF

	sed -i \
      -e "s/spec:/spec:\n  volumeName: ${VOLUME}\n  storageClassName: standard/g" \
      $VOLUMECLAIM	    

done

sed -i \
    -e 's/ReadWriteOnce/ReadOnlyMany/g' /workspace/deploy/k8s/pv/jenkins-data-persistentvolume.yaml

#this commands deploy persistance volume and services
kubectl apply -f /workspace/deploy/k8s/pv
kubectl apply -f /workspace/deploy/k8s