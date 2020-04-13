# Creating a Cluster

This will build the k8s configuration files and deploy them to a managed Kubernetes cluster in GCP. You will need to:

* Update [.env](./env) with your account, zone, and cluster information
* Download your `key.json` file from GCP for the account that has access to `deploy/gcp/key.json`

Create a new Kubernetes cluster within the targeted GCP environment using the command line and the docker-compose utility:

```
cd deploy
docker-compose run create-cluster
```

Once this is done, you can build and deploy the environment to your cluster:

```
docker-compose run gcp
```

Note that the gcp command will create a baseline cluster with no configuration in it.  If you want to restore from a set of snapshots see the snapshots folder and the README there.

# Updating a Cluster

There are many instances where you will need to perform a rolling update within a cluster to deploy new images to your running pods.  To do this, you will first need to update the image in the gcr so that Kubernetes Engine can pull it.

Next, identify the image by a specific name or unique tag.  You can get this from the Container Registry section of the Google Cloud Platform console web interface.  Go into the image name you intend to update and you should see a document icon when you hover over the name with a tool tip that reads "Copy full image name".  Click it to save the value in your clipboard.

First, configure kubectl to target the cluster you want to administer. Variables here should match your [.env](./env) file:

```
gcloud container clusters get-credentials GCP_CLUSTER --zone GCP_ZONE
```

Now, using kubectl, run:

```
kubectl set image deployments/DEPLOYMENT_NAME CONTAINER_NAME=IMAGE_NAME
```

The DEPLOYMENT_NAME and CONTAINER_NAME variables are going to come from the kompose yaml files used to automate the deployment to the cluster.  These files are found in /deploy/k8s.  If you don't have them you can generate them with kompose via the command:

```
docker-compose run k8s
```

DEPLOYMENT_NAME is found in the property path `metadata.name`.  CONTAINER_NAME is found in the property path `spec.template.spec.container.name`.  In many cases they are the same value.  IMAGE_NAME is the unique id copied from the container registry.

Here is an example using the mybank (production) deployment found in the transitory file /deploy/k8s/mybank-deployment.yaml:

```
kubectl set image deployments/mybank mybank=us.gcr.io/kpmg-demos/devops-demo-mybank-production@sha256:51317f79054aadba3057513e84337d69855a985c25d57675b7af6dfba3cb0ff9
```

Once you run the command you should see a response similar to:

```
deployment.extensions/DEPLOYMENT_NAME image updated
```

If you do not the image was not updated.  Keep in mind that there must be a difference in the image names that are running in the deployments for this command to take effect.  For example, if you created the deployment with an image tag of 'latest' and attempt to set a new image with the same tag, no state difference will be identified between the two deployments and nothing will happen.  This is why it is a good idea to target specific image names when running deployments, in general.  It also makes reverting these updates easier as well.

# Taking down a cluster

This will destroy an existing cluster and the associated disks of the cluster.

```
cd deploy
docker-compose run destroy-cluster
```

A prompt will confirm the expected cluster and zone before it is deleted:

    The following clusters will be deleted.
    - [<cluster name>] in [<zone>]

    Do you want to continue (Y/n)?

Press `[enter]` (or `Y` and `[enter]`) to continue or use `[ctrl]+c` to interupt the progress.
