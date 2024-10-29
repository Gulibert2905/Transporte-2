const mysqldump = require('mysqldump');
const config = require('../config/config');
const path = require('path');
const fs = require('fs');

const backup = async () => {
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups');
    
    // Crear directorio de backups si no existe
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    const filename = path.join(backupDir, `backup-${config.app.env}-${date}.sql`);

    try {
        await mysqldump({
            connection: {
                host: config.db.host,
                user: config.db.user,
                password: config.db.password,
                database: config.db.database,
            },
            dumpToFile: filename,
        });

        console.log(`Backup creado exitosamente: ${filename}`);
    } catch (error) {
        console.error('Error creando backup:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    backup();
}

module.exports = backup;