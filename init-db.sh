#!/bin/bash

# Database initialization script
set -e

echo "Initializing PostgreSQL database..."

# Create database and user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER attendance_user WITH PASSWORD 'attendance_pass';
    CREATE DATABASE attendance_system;
    GRANT ALL PRIVILEGES ON DATABASE attendance_system TO attendance_user;
EOSQL

# Apply schema
echo "Applying database schema..."
psql -v ON_ERROR_STOP=1 --username "attendance_user" --dbname "attendance_system" -f db/schema.sql

echo "Database initialization complete!"