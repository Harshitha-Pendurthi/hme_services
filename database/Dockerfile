FROM mysql:8.0

# Set environment variables
ENV MYSQL_DATABASE=home_services_db
ENV MYSQL_ROOT_PASSWORD=password

# Copy initialization scripts
COPY schema.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY seed_data.sql /docker-entrypoint-initdb.d/02-seed_data.sql

# Copy custom MySQL configuration
COPY my.cnf /etc/mysql/conf.d/

# Expose port
EXPOSE 3306

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD mysqladmin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD || exit 1
