#!/bin/bash

# Variables
APP_NAME="cemedic"
DEPLOY_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
GIT_REPO="tu_repositorio_git"

# Crear directorios necesarios
mkdir -p $DEPLOY_DIR
mkdir -p $BACKUP_DIR

# Backup de la versión actual
if [ -d "$DEPLOY_DIR/current" ]; then
    timestamp=$(date +%Y%m%d_%H%M%S)
    mv $DEPLOY_DIR/current $BACKUP_DIR/$timestamp
fi

# Clonar nueva versión
git clone $GIT_REPO $DEPLOY_DIR/current

# Instalar dependencias
cd $DEPLOY_DIR/current
npm install --production

# Copiar archivo de configuración
cp /etc/cemedic/.env.production $DEPLOY_DIR/current/.env

# Ejecutar migraciones
NODE_ENV=production npm run migrate

# Reiniciar servicio
pm2 restart $APP_NAME

# Notificar
echo "Despliegue completado: $(date)"