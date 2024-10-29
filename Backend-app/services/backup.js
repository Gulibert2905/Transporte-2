const mysqldump = require('mysqldump');
const path = require('path');
const fs = require('fs');
const { logger } = require('./logger');
const config = require('../config/config');

const backup = async () => {
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups');
    
    // Crear directorio si no existe
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    try {
        await mysqldump({
            connection: {
                host: config.db.host,
                user: config.db.user,
                password: config.db.password,
                database: config.db.database,
            },
            dumpToFile: path.join(backupDir, `backup-${date}.sql`),
            compressFile: true,
        });

        // Mantener solo los últimos 7 backups
        const files = fs.readdirSync(backupDir);
        if (files.length > 7) {
            files.sort((a, b) => {
                return fs.statSync(path.join(backupDir, b)).mtime.getTime() - 
                       fs.statSync(path.join(backupDir, a)).mtime.getTime();
            });

            files.slice(7).forEach(file => {
                fs.unlinkSync(path.join(backupDir, file));
            });
        }

        logger.info('Backup creado exitosamente');
    } catch (error) {
        logger.error('Error creando backup:', error);
        throw error;
    }
};

module.exports = {
    backup,
    scheduleBackup: () => {
        // Ejecutar backup diario a las 3 AM
        const cron = require('node-cron');
        cron.schedule('0 3 * * *', async () => {
            try {
                await backup();
            } catch (error) {
                logger.error('Error en backup programado:', error);
            }
        });
    }
};