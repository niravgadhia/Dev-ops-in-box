#!/bin/bash

rm -rf /workspace/deploy/k8s/*.yaml

# TODO: need to not override existing environment variables already set/exported
export $(cat /workspace/.env | xargs) && \
export $(cat /workspace/deploy/gcp/.env | xargs) && \
export NGINX_RESOLVER=kube-dns.kube-system.svc.cluster.local && \
export NGINX_SERVICE_SUFFIX=.default.svc.cluster.local && \
kompose -f /workspace/docker-compose.yml convert

if [ $DOCKER_IMAGE_TAG == "latest" ]
then
    echo "WARNING: forcing image pull every deployment when using '$DOCKER_IMAGE_TAG' tag for development purposes"
    for DEPLOYMENT in $(find /workspace/deploy/k8s/*-deployment.yaml -type f)
    do
        sed -i \
            -e 's/image:/imagePullPolicy: Always\n        image:/g' \
            -e 's/creationTimestamp: null/creationTimestamp: '"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'/g' \
            $DEPLOYMENT
    done
fi

# no kompose mapping, for services running non-root, need to set securityContexts for user
sed -i -e 's/containers:/securityContext:\n        fsGroup: 1000\n      containers:/g' /workspace/deploy/k8s/jenkins-deployment.yaml
sed -i -e 's/containers:/securityContext:\n        fsGroup: 1030\n      containers:/g' /workspace/deploy/k8s/artifactory-deployment.yaml

# fix until https://github.com/kubernetes/kompose/issues/1046, shared volume between master and agents
# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/artifactory-data-persistentvolumeclaim.yaml
# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/hubot-config-persistentvolumeclaim.yaml

# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/jenkins-data-persistentvolumeclaim.yaml
# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/jenkins-workspace-persistentvolumeclaim.yaml

# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/openldap-config-persistentvolumeclaim.yaml
# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/openldap-data-persistentvolumeclaim.yaml

# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/rocketchat-data-persistentvolumeclaim.yaml
# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/rocketchat-database-data-persistentvolumeclaim.yaml

# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/sonarqube-data-persistentvolumeclaim.yaml
# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/sonarqube-database-data-persistentvolumeclaim.yaml

# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/gitlab-data-persistentvolumeclaim.yaml
# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/gitlab-database-data-persistentvolumeclaim.yaml
# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/gitlab-redis-data-persistentvolumeclaim.yaml

# sed -i -e 's/ReadWriteOnce/ReadWriteMany/g' /workspace/deploy/k8s/*-persistentvolumeclaim.yaml

sed -i -e 's/storage: 100Mi/storage: 10Gi/g' /workspace/deploy/k8s/*-persistentvolumeclaim.yaml

# set static IP address for proxy service if configured
# append 'loadBalancerIP: [ip address]' after 'type: LoadBalancer'
if [ -n "${GCP_CLUSTER_PROXY_IP}" ]
then
    sed -i -e '/  type: LoadBalancer/a\'$'\n''\  loadBalancerIP: '$GCP_CLUSTER_PROXY_IP'\'$'\n''' /workspace/deploy/k8s/proxy-service.yaml
fi
