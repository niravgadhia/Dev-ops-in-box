# Modern Delivery Deployment Quick Start

The most common deployment scheme for setting up a new Modern Delivery cluster is to setup the
configuration to indicate the environment to deploy, create a new cluster, load the new cluster with
a known configuration from pre-existing snapshots, minor manual configurations, and finally destroy
the cluster when it is no longer actively needed.

All commands below are ran from the same directory as this README (i.e. `../modern-delivery/devops/deploy`).

There are options for deployment including disks without preloaded configurations. Use the READMEs
in the subdirectories to learn more.

NOTE: Each step below will take several minutes to complete.


# Configuration

* Update [gcp/.env](./gcp/.env) with account, zone, cluster information, and snapshot version.
* Place your `key.json` file from GCP in the [gcp](./gcp) directory.


# Create a Cluster

Create a new Kubernetes cluster within the targeted GCP environment:

```
docker-compose run create-cluster
```

The cluster will not be usable at this point, but is ready for further configuration and the
creation of persistent volumes. Persistent volumes are also known as "disks" in Google Cloud.


# Deploy Snapshots to Cluster

After a new cluster is created deploy the snapshots. This should be completed immediately after
creating a cluster which hasn't had disks created. This will not work on a cluster with existing
disks.

Deploy snapshots:

```
docker-compose run snapshots-deploy
```

# Manual configuration

Once the snapshots are deployed the majority of the cluster will be operational, however, a few
manual configuration steps are required.

* Login in to Jenkins in the newly created cluster (i.e. https://modern-delivery-dev.kpmgdemos.com/jenkins)
  * Username: devops-admin
  * Password: P@ssw0rd
* Click on the "Build Executor Status" link
* Two nodes should be listed: "master" and "docker-agent-[id hash]"
* Configure the master node:User the gear icon to configure "master"
  * Use the gear icon to edit details
  * Set the "# of executors" to "2"
  * Click "Save"
* Return to the "Build Executor Status" and configure the docker-agent to have "5" executors.

The cluster is now configured and available for use. Inspect the various components to verify
expected operation.


# Destroy a Cluster

Once a cluster is no longer needed it should be destroyed to keep costs down.

WARNING: Destroying a cluster will make it unusable and will result in data loss of any disks that
have not been backed-up or snapshotted.

Double check the configuration in [gcp/.env](./gcp/.env) to ensure the desired cluster for removal
is the one configured. Please, do not delete the wrong cluster.

Destroy cluster:

```
docker-compose run destroy-cluster
```

A prompt will confirm the expected cluster and zone before it is deleted:

    The following clusters will be deleted.
    - [<cluster name>] in [<zone>]

    Do you want to continue (Y/n)?

Press `[enter]` (or `Y` and `[enter]`) to continue or use `[ctrl]+c` to interupt the process.

NOTE: No further prompts will be made before removing disks.
