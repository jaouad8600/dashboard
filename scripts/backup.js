#!/usr/bin/env node

/**
 * Database Backup Utility for SportDash
 * 
 * Creates timestamped backups of the SQLite database
 * Usage: node scripts/backup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DB_PATH = path.join(__dirname, '../prisma/dev.db');
const BACKUP_DIR = path.join(__dirname, '../backups');
const RETENTION = {
    daily: 7,    // Keep last 7 days
    weekly: 4,   // Keep last 4 weeks
    monthly: 3   // Keep last 3 months
};

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log('📁 Created backup directory');
}

// Generate timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '-' +
    new Date().toTimeString().split(' ')[0].replace(/:/g, '');
const backupName = `sportdash-${timestamp}.db`;
const backupPath = path.join(BACKUP_DIR, backupName);

try {
    // Check if database exists
    if (!fs.existsSync(DB_PATH)) {
        console.error('❌ Database file not found:', DB_PATH);
        process.exit(1);
    }

    // Create backup
    console.log('🔄 Creating backup...');
    fs.copyFileSync(DB_PATH, backupPath);

    const stats = fs.statSync(backupPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('✅ Backup created successfully!');
    console.log(`   File: ${backupName}`);
    console.log(`   Size: ${fileSizeMB} MB`);
    console.log(`   Location: ${backupPath}`);

    // Cleanup old backups
    cleanupOldBackups();

} catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
}

function cleanupOldBackups() {
    console.log('\n🧹 Cleaning up old backups...');

    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('sportdash-') && f.endsWith('.db'))
        .map(f => ({
            name: f,
            path: path.join(BACKUP_DIR, f),
            mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

    const now = new Date();
    const keep = new Set();

    // Keep daily backups (last 7 days)
    const dailyBackups = files.filter(f => {
        const age = (now - f.mtime) / (1000 * 60 * 60 * 24);
        return age <= RETENTION.daily;
    });
    dailyBackups.forEach(f => keep.add(f.name));

    // Keep weekly backups (last 4 weeks, one per week)
    for (let week = 0; week < RETENTION.weekly; week++) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (week * 7));
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekBackup = files.find(f =>
            f.mtime >= weekStart && f.mtime < weekEnd
        );
        if (weekBackup) keep.add(weekBackup.name);
    }

    // Keep monthly backups (last 3 months, one per month)
    for (let month = 0; month < RETENTION.monthly; month++) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - month, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - month + 1, 0);

        const monthBackup = files.find(f =>
            f.mtime >= monthStart && f.mtime <= monthEnd
        );
        if (monthBackup) keep.add(monthBackup.name);
    }

    // Delete backups not in keep set
    let deleted = 0;
    files.forEach(f => {
        if (!keep.has(f.name)) {
            fs.unlinkSync(f.path);
            deleted++;
            console.log(`   🗑️  Deleted: ${f.name}`);
        }
    });

    console.log(`\n📊 Cleanup complete:`);
    console.log(`   - ${keep.size} backups retained`);
    console.log(`   - ${deleted} old backups deleted`);
}
