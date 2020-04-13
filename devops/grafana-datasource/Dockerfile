FROM postgres:12.2

USER root

# See http://docs.grafana.org/features/datasources/postgres/ for information about setting up the
# metric tables and data types, the user-only user permissions, and queries.
COPY docker-entrypoint-initdb.d /docker-entrypoint-initdb.d
RUN chmod +r /docker-entrypoint-initdb.d/*.sql
RUN chmod a+r /docker-entrypoint-initdb.d/*.sh
RUN chmod a+x /docker-entrypoint-initdb.d/*.sh

