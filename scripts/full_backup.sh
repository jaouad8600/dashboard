#!/bin/bash

# Get current date
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="sportdash-full-backup-$TIMESTAMP.tgz"
BACKUP_DIR="./backups"

# Ensure backup dir exists
mkdir -p $BACKUP_DIR

echo "Creating full project backup: $BACKUP_NAME"

# Create tarball excluding node_modules, .next, .git, and backups folder itself
tar --exclude='./node_modules' \
    --exclude='./.next' \
    --exclude='./.git' \
    --exclude='./backups' \
    --exclude='./.DS_Store' \
    -czf "$BACKUP_DIR/$BACKUP_NAME" .

echo "Backup created at $BACKUP_DIR/$BACKUP_NAME"
