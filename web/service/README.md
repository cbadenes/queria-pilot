
# Configurar Aplicación Node.js como Servicio systemd

Este documento describe cómo configurar una aplicación Node.js para que se ejecute como un servicio en sistemas operativos basados en Linux usando systemd. Esto asegurará que la aplicación se inicie automáticamente en el arranque y se reinicie en caso de fallos.

## Crear un Archivo de Unidad systemd

1. **Crea un archivo de servicio systemd** llamado `web-app.service` en el directorio `/etc/systemd/system/` con el siguiente contenido:

    ```ini
    [Unit]
    Description=Mi Aplicación Web Node.js
    After=network.target

    [Service]
    User=miusuario
    WorkingDirectory=/ruta/a/tu/aplicacion/web
    ExecStart=/usr/bin/npm start
    Restart=always
    Environment="PORT=3000" "NODE_ENV=production"

    [Install]
    WantedBy=multi-user.target
    ```

   Cambia `miusuario` por el usuario que desees que ejecute el servicio y ajusta la ruta del directorio de tu proyecto Node.js y el camino al ejecutable `npm` según sea necesario.

2. **Recarga los daemons systemd** para que reconozcan tu nuevo archivo de servicio:

    ```bash
    sudo systemctl daemon-reload
    ```

## Habilitar y Arrancar el Servicio

1. **Habilita el servicio** para que se inicie automáticamente en el arranque del sistema:

    ```bash
    sudo systemctl enable web-app.service
    ```

2. **Arranca el servicio** con el siguiente comando:

    ```bash
    sudo systemctl start web-app.service
    ```

## Comandos Útiles

- **Verificar el estado del servicio**:

    ```bash
    sudo systemctl status web-app.service
    ```

- **Ver los logs del servicio** para diagnóstico y monitoreo:

    ```bash
    sudo journalctl -u web-app.service
    ```

## Consideraciones Adicionales

- Asegúrate de que el usuario bajo el cual se ejecuta el servicio tenga los permisos necesarios para acceder y ejecutar todo lo necesario en el directorio de la aplicación.
- Ajusta las dependencias del servicio en el parámetro `After=` si tu aplicación depende de otros servicios.
- Define las variables de entorno necesarias directamente en el archivo de servicio.

Este método te permitirá mantener tu aplicación Node.js funcionando continuamente en el fondo como un servicio del sistema.
