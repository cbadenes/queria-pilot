#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Estado de los servicios de Queria:${NC}\n"

echo -e "${GREEN}Estado del Worker:${NC}"
sudo systemctl status queria-worker.service

echo -e "\n${GREEN}Estado del API:${NC}"
sudo systemctl status queria.service