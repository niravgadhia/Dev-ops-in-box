#!/bin/bash

sed \
    -e 's/{{LDAP_BASE_DN}}/'"$LDAP_BASE_DN"'/g' \
    -e 's/{{LDAP_READONLY_USER_USERNAME}}/'"$LDAP_READONLY_USER_USERNAME"'/g' \
    -e 's/{{LDAP_READONLY_USER_PASSWORD}}/'"$LDAP_READONLY_USER_PASSWORD"'/g' \
    /etc/grafana/ldap_tmpl.toml > /etc/grafana/ldap.toml

cp /etc/grafana/grafana.ini /etc/grafana/grafana.backup

root_url=";root_url = %(protocol)s://%(domain)s:%(http_port)s/grafana/"
serve_from=";serve_from_sub_path = true"

sed -e '/;root_url.*/c\'"$root_url" /etc/grafana/grafana.ini > /etc/grafana/grafana.backup2
sed -e '/;serve_from_sub_path/c\'"$serve_from" /etc/grafana/grafana.backup2 > /etc/grafana/grafana.ini

rm /etc/grafana/grafana.backup2
                                                                                
# cp -r /dashboards /var/lib/grafana/dashboards

# run the default command from base image
/run.sh
