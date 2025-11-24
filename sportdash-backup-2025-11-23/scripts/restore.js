#!/usr/bin/env node

/**
 * Database Restore Utility for SportDash
 * 
 * Restores database from a backup file
 * Usage: node scripts/restore.js backups/sportdash-2024-01-15.db
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DB_PATH = path.join(__dirname, '../prisma/dev.db');

// Get backup file from command line argument
const backupFile = process.argv[2];

if (!backupFile) {
    console.error('❌ Usage: node scripts/restore.js <backup-file>');
    console.error('   Example: node scripts/restore.js backups/sportdash-2024-01-15.db');
    process.exit(1);
}

const backupPath = path.isAbsolute(backupFile)
    ? backupFile
    : path.join(__dirname, '..', backupFile);

// Check if backup file exists
if (!fs.existsSync(backupPath)) {
    console.error('❌ Backup file not found:', backupPath);
    process.exit(1);
}

// Confirm with user
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('⚠️  WARNING: This will replace the current database!');
console.log(`   Current DB: ${DB_PATH}`);
console.log(`   Backup file: ${backupPath}`);
console.log('');

rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
    if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Restore cancelled');
        rl.close();
        process.exit(0);
    }

    try {
        // Create backup of current database first
        if (fs.existsSync(DB_PATH)) {
            const preRestoreBackup = DB_PATH + '.pre-restore-' + Date.now();
            console.log('\n💾 Creating safety backup of current database...');
            fs.copyFileSync(DB_PATH, preRestoreBackup);
            console.log(`   Saved to: ${preRestoreBackup}`);
        }

        // Restore from backup
        console.log('\n🔄 Restoring from backup...');
        fs.copyFileSync(backupPath, DB_PATH);

        const stats = fs.statSync(DB_PATH);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log('✅ Database restored successfully!');
        console.log(`   Size: ${fileSizeMB} MB`);
        console.log('\n⚠️  Remember to restart the application!');

    } catch (error) {
        console.error('❌ Restore failed:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
});
