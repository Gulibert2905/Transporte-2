const fs = require('fs');
const path = require('path');

const setEnvironment = (env) => {
    const envFile = path.join(__dirname, '..', `.env.${env}`);
    const currentEnv = path.join(__dirname, '..', '.env');

    try {
        if (fs.existsSync(envFile)) {
            fs.copyFileSync(envFile, currentEnv);
            console.log(`Ambiente configurado a: ${env}`);
        } else {
            console.error(`Archivo .env.${env} no encontrado`);
            process.exit(1);
        }
    } catch (error) {
        console.error('Error configurando el ambiente:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    const env = process.argv[2] || 'development';
    setEnvironment(env);
}

module.exports = setEnvironment;