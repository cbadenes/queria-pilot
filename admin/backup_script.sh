#!/bin/bash

# Configuración
BACKUP_DIR="./mongo-backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FOLDER="${BACKUP_DIR}/${DATE}"
CONTAINER_NAME="$(docker-compose ps -q mongo)"
COLLECTIONS=("comments" "questions" "questionnaires" "users")
MONGO_USER="admin"
MONGO_PASS="example"
DB_NAME="queria"  # Nombre de tu base de datos

# Crear el directorio de backup si no existe
mkdir -p "${BACKUP_FOLDER}"
echo "Creando directorio de backup: ${BACKUP_FOLDER}"

# Función para realizar backup de una colección
backup_collection() {
    local collection=$1
    echo "Realizando backup de la colección: ${collection}"
    
    docker exec ${CONTAINER_NAME} mongodump \
        --host localhost \
        --username ${MONGO_USER} \
        --password ${MONGO_PASS} \
        --authenticationDatabase admin \
        --db ${DB_NAME} \
        --collection ${collection} \
        --out /backups/temp_dump
    
    # Mover los archivos al directorio del backup con fecha
    docker exec ${CONTAINER_NAME} mv /backups/temp_dump/${DB_NAME}/${collection}.bson /backups/${DATE}/
    docker exec ${CONTAINER_NAME} mv /backups/temp_dump/${DB_NAME}/${collection}.metadata.json /backups/${DATE}/
    
    # Convertir el BSON a JSON para facilitar análisis posteriores
    echo "Convirtiendo ${collection} a JSON para análisis"
    docker exec ${CONTAINER_NAME} bsondump /backups/${DATE}/${collection}.bson > "${BACKUP_FOLDER}/${collection}.json"
}

# Realizar backup de cada colección
for collection in "${COLLECTIONS[@]}"
do
    backup_collection ${collection}
done

# Limpiar archivos temporales
docker exec ${CONTAINER_NAME} rm -rf /backups/temp_dump

echo "Backup completado en: ${BACKUP_FOLDER}"
echo "Los archivos están disponibles en formato BSON y JSON para su análisis"

# Registrar el backup en el archivo de logs
echo "${DATE}: Backup completado de ${#COLLECTIONS[@]} colecciones" >> "${BACKUP_DIR}/backup_history.log"
