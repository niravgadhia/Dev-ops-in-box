#!/bin/bash

# See https://cloud.google.com/community/tutorials/setting-up-postgres
# need to edit pg_hba.conf to allow connections to/from other containers in the cluster
# run this file automatically from this folder; 
# https://docs.docker.com/samples/library/postgres/#how-to-extend-this-image
echo append line to pg_hba.conf
echo host all all 0.0.0.0/0 md5 >> /var/lib/postgresql/data/pgdata/pg_hba.conf

echo reload postgres configuration
psql -U grafana -c "select pg_reload_conf();"
