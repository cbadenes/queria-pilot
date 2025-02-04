#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Deteniendo servicios de Queria...${NC}"

# Detener el servicio API
echo -e "${GREEN}Deteniendo API...${NC}"
sudo systemctl stop queria.service

# Detener el servicio Worker
echo -e "${GREEN}Deteniendo Worker...${NC}"
sudo systemctl stop queria-worker.service

echo -e "${GREEN}¡Servicios detenidos!${NC}"