#!/bin/bash

# Database Setup Script for Pedidos YEMM
# This script creates the database schema in PostgreSQL

echo "==================================="
echo "Pedidos YEMM - Database Setup"
echo "==================================="
echo ""

# Database configuration (update these if needed)
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres}"

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ Error: PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL first"
    exit 1
fi

echo "✓ PostgreSQL found"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="$SCRIPT_DIR/database/schema.sql"

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ Error: Schema file not found at $SCHEMA_FILE"
    exit 1
fi

echo "✓ Schema file found"
echo ""

# Prompt for password
echo "Please enter PostgreSQL password for user '$DB_USER':"
read -s DB_PASSWORD
echo ""

# Test connection
echo "Testing database connection..."
export PGPASSWORD="$DB_PASSWORD"

if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
    echo "❌ Error: Could not connect to database"
    echo "Please check your credentials and make sure PostgreSQL is running"
    exit 1
fi

echo "✓ Database connection successful"
echo ""

# Run schema
echo "Creating database schema..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE"; then
    echo ""
    echo "✓ Database schema created successfully!"
    echo ""
    
    # Show created tables
    echo "Tables created:"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt"
    
    echo ""
    echo "==================================="
    echo "Setup completed successfully! ✓"
    echo "==================================="
    echo ""
    echo "Next steps:"
    echo "1. Start the server: cd src && npm start"
    echo "2. Open index.html in a browser"
    echo "3. Orders will now be saved to the database!"
    echo ""
else
    echo ""
    echo "❌ Error: Failed to create schema"
    echo "Please check the error messages above"
    exit 1
fi

# Clean up
unset PGPASSWORD
