#!/bin/bash

# Configuración
BACKUP_DIR="/ruta/a/mongo-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MONGODB_HOST="127.0.0.1"
MONGODB_PORT="27017"
MONGODB_USER="admin"
MONGODB_PASS="example"

# Crear directorio de backup si no existe
mkdir -p $BACKUP_DIR

# Realizar backup
docker exec -t queria-mongo-1 mongodump \
  --host $MONGODB_HOST \
  --port $MONGODB_PORT \
  --username $MONGODB_USER \
  --password $MONGODB_PASS \
  --authenticationDatabase admin \
  --out /backups/backup_$TIMESTAMP

# Comprimir backup
cd $BACKUP_DIR
tar -czf backup_$TIMESTAMP.tar.gz backup_$TIMESTAMP
rm -rf backup_$TIMESTAMP

# Mantener solo los últimos 7 backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

# Registrar en log
echo "Backup completado: $TIMESTAMP" >> $BACKUP_DIR/backup.log