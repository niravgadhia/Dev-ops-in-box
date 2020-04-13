FROM grafana/grafana:6.7.2

# AUTH
# Allow login use for LDAP
ENV GF_AUTH_LDAP_ENABLED=true

# Username used for LDAP auth access
ENV LDAP_READONLY_USER_USERNAME="readonly"

# Allow anonymous users to view dashboards
ENV GF_AUTH_ANONYMOUS_ENABLED=true


# WEB ROUTING
# Settings for subpath proxy use.
# http://docs.grafana.org/installation/behind_proxy/
# ENV GF_SERVER_DOMAIN=localhost
# ENV GF_SERVER_DOMAIN=${DOS_HOSTNAME}
ENV GF_SERVER_ROOT_URL=%(protocol)s://%(domain)s/grafana/
ENV GF_SERVER_SERVE_FROM_SUB_PATH=ture
# ENV GF_SERVER_ROOT_URL=http://localhost/grafana/


# CONFIG
USER root

# LDAP configuration
COPY ldap_tmpl.toml /etc/grafana/

# Datasource and dashboard provisioning
COPY provisioning /etc/grafana/provisioning/

# Dashboard definitions
# RUN mkdir /var/lib/grafana/dashboards/
COPY dashboards /var/lib/grafana/dashboards/

# The above was failing when deployed.. Maybe is overwritten after? No permissions?
# Copy to temp directory on root, then move to correct location in init.sh
# COPY dashboards /dashboards

# ENTRYPOINT
COPY ./init.sh /init.sh
ENTRYPOINT ["/init.sh"]
