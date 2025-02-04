#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Iniciando servicios de Queria...${NC}"

# Iniciar primero el Worker
echo -e "${YELLOW}Iniciando Worker...${NC}"
sudo systemctl start queria-worker.service

# Esperar unos segundos para asegurar que el Worker está listo
sleep 5

# Verificar estado del Worker
worker_status=$(sudo systemctl is-active queria-worker.service)
if [ "$worker_status" = "active" ]; then
    echo -e "${GREEN}Worker iniciado correctamente${NC}"
    
    # Iniciar el API
    echo -e "${YELLOW}Iniciando API...${NC}"
    sudo systemctl start queria.service
    
    # Verificar estado del API
    api_status=$(sudo systemctl is-active queria.service)
    if [ "$api_status" = "active" ]; then
        echo -e "${GREEN}API iniciado correctamente${NC}"
        echo -e "${GREEN}¡Todos los servicios están activos!${NC}"
    else
        echo -e "${RED}Error al iniciar el API${NC}"
    fi
else
    echo -e "${RED}Error al iniciar el Worker${NC}"
fi