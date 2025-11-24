#!/bin/bash
# Backup script for the Sportdash project
# -------------------------------------------------
# This script creates a tar.gz archive containing:
#   - All source files (excluding node_modules and .next)
#   - The SQLite development database (prisma/dev.db)
#   - .env file (if present) for environment variables
#   - package.json and package-lock.json (or yarn.lock) for dependencies
#   - prisma schema and migrations
# -------------------------------------------------

# Define backup name with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="sportdash_backup_${TIMESTAMP}.tar.gz"

# Files/directories to include
INCLUDE="src prisma public public\* .next .env package.json package-lock.json yarn.lock tsconfig.json next.config.js"

# Exclude heavy directories that can be regenerated
EXCLUDE="node_modules .git"

# Create the archive
echo "Creating backup ${BACKUP_NAME}..."

tar --exclude=${EXCLUDE} -czvf ${BACKUP_NAME} ${INCLUDE}

# Verify
if [ $? -eq 0 ]; then
  echo "Backup created successfully: ${BACKUP_NAME}"
else
  echo "Backup failed. Please check the script and file permissions."
fi
