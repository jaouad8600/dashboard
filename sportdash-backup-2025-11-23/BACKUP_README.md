# Backup & Restore - SportDash

## Quick Reference

### Daily Operations

```bash
# Create backup
npm run db:backup

# Restore from backup
npm run db:restore backups/sportdash-2024-01-15-140530.db

# Seed development database
npm run db:seed

# Reset development database
npm run db:reset
```

### Backup Files
- Location: `backups/`
- Format: `sportdash-YYYY-MM-DD-HHmmss.db`
- Retention: 7 daily, 4 weekly, 3 monthly

### Recovery Scenarios

**Individual Record**: Extract from backup using database tools  
**Full Restore**: Use `npm run db:restore`  
**Fresh Start (Dev)**: Use `npm run db:reset && npm run db:seed`

---

For complete documentation, see [backup_restore_guide.md](file:///Users/jaouadelhahaoui/.gemini/antigravity/brain/ffc8a547-4d85-4156-b0ad-1291b2828830/backup_restore_guide.md)
