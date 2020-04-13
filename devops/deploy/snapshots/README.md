This will help you create the snapshot from existing cluster and build the k8s configuration files and deploy them to an new managed Kubernetes cluster in GCP. You will need to:

* Create a new Kubernetes cluster in GCP

    Cluster settings:
    (NOTE: some options are only accessible under "More Options" when performed through the web interface)
    1. 4 nodes
    2. Machine type of "n1-standard-8" (8 vCPUs, 30 GB memory)
    2. Autoscale 3-8 nodes
    3. 500GB boot disk size (Standard persistent disk)
    4. Auto upgrade disabled
    5. Add a separate node pool, called "jenkins-pool" with a single node in it, same machine type and disk specs as above. Both Jenkins services will deploy to this node so they can share a common volume.

* Update [.env](./env) with your snapshot-suffix, snapshot-prefix, account, zone, and cluster information in `deploy/gcp` folder
* optionally / recommended; set GCP_CLUSTER_PROXY_IP to an existing reserved IP address;
    | URL-Subdomain       | IP Address      |
    |---------------------|-----------------|
    | modern-delivery-1	  | 35.193.208.21   |
    | modern-delivery-2   |	35.193.16.44    |
    | modern-delivery-3   |	104.155.179.254 |
    | modern-delivery-4   |	34.73.107.100   |
    | modern-delivery-dev | 35.239.5.191    |

* Download your `key.json` file from GCP for the account that has access to `deploy/gcp/key.json`

If the proxy IP address was not set in .env, or if for any reason it needs to be changed after deploying;
Go to the services page for the cluster, find the Proxy service, click on it, then click on Edit. This brings up the YAML definition of the service. Insert a line near the end. After the line:
`type: loadBalancer`,
add:
 `loadBalancerIP: "YOUR.IP.ADDRESS.HERE"`

Use one of the above IP addresses. Click save to save chanes.
The cluster proxy will then be available at `modern-delivery-1.kpmgdemos.com`, for example.

# Create Snapshots from existing cluster

Please update the SNAPSHOT_SUFFIX and SNAPSHOT_PREFIX in `deploys/gcp/.env` file  (eg. modern-dev-demo, snapshot-1)

Once this is done, run the command to create snapshot from your existing kubernetes cluster:
```
cd deploy
docker-compose run create-snapshots
```

# Create disks from snapshots and deploy to new cluster

This should be done only once when you create the new cluster it will not work in existing cluster.

Once you create the new kubernetes cluster you want to deploy using existing snapshots update the environments in `deploy/gcp/.env` to reflect new kubernetes cluster name and zone

After that run following command to create the disks, persistentvolume in new cluster and start the services.
```
cd deploy
docker-compose run snapshots-deploy
```

# Update cluster that are created using snapshots

This will use the existing persistentvolume and update the cluster, standard run of docker-compose run gcp will produce error so use this command instead that updates the persistentvolumeclaims.yaml file to use existing disks
```
cd deploy
docker-compose run gcp-pv
```

