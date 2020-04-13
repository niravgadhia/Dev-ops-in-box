# Updating the REST Container Image

When changes are made to the api server the corresponding image stored in our Google Container Registry (gcr) needs to be updated as well. This will ensure that any future deployments of the container reflect the latest source code.

In order to rebuild the container, use the command:

`docker-compose build grafana-datasource-rest`

Then, in order to deploy the container to the gcr use the command:

`docker-compose push grafana-datasource-rest`

You should then be able to go to the [gcr console](https://console.cloud.google.com/gcr/images/kpmg-demos/US/devops-demo-grafana-datasource-rest) and see that the latest version of the image has been changed.

# Updating the Gitlab Sourcecode Export

Whenever the application source code changes, those changes also need to be reflected in future cluster deployments. Currently, there is a good deal of state within the Gitlab container where the application source code lives during the demo, and that state is not easily reproducible from a raw container image.  Therefore we are using snapshots to recreate it for new clusters. This means that additional steps must be taken in order to both preserve the Gitlab state and also reflect the newest source code for the application.

The process we are currently using is:
- Bring up a cluster with the latest Gitlab snapshot.
- Go into the Gitlab instance and mirror whatever code changes are being made to the application directly within the Gitlab web editor and commit those changes.
- Export those changes as a tarball file, save them locally to your filesystem. Use: Settings > Export Project > Expand > Export Project.
- Upload the tarball to the public bucket for the demos:  https://console.cloud.google.com/storage/browser/demos-public-assets?project=kpmg-demos
- Update the references to the import file in the client demo configuration (demo-config.js) in the "Pre-demo logins" step.

Afterwards, when the client demo starts it will wipe the Gitlab instance in the cluster and import the newly exported code back in with all the new content.