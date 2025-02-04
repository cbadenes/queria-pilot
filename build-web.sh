#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Iniciando el proceso de construcción...${NC}"

# Directorio del proyecto web (ajusta según tu estructura)
WEB_DIR="web"
# Directorio de destino para Nginx
NGINX_DIR="/var/www/html"

# Entrar al directorio web
cd $WEB_DIR

# Instalar dependencias
echo -e "${GREEN}Instalando dependencias...${NC}"
npm install

# Construir la aplicación
echo -e "${GREEN}Construyendo la aplicación...${NC}"
npm run build

# Verificar si la construcción fue exitosa
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Construcción completada exitosamente${NC}"
    
    # Limpiar directorio de destino
    echo -e "${GREEN}Limpiando directorio de destino...${NC}"
    sudo rm -rf $NGINX_DIR/*
    
    # Copiar archivos construidos a Nginx
    echo -e "${GREEN}Copiando archivos al directorio de Nginx...${NC}"
    sudo cp -r build/* $NGINX_DIR/
    
    # Ajustar permisos
    echo -e "${GREEN}Ajustando permisos...${NC}"
    sudo chown -R www-data:www-data $NGINX_DIR
    sudo chmod -R 755 $NGINX_DIR
    
    echo -e "${GREEN}¡Despliegue completado!${NC}"
else
    echo -e "${RED}Error durante la construcción${NC}"
    exit 1
fi

# Reiniciar Nginx
echo -e "${GREEN}Reiniciando Nginx...${NC}"
sudo systemctl restart nginx

echo -e "${GREEN}¡Proceso completado!${NC}"