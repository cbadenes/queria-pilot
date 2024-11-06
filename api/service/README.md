# Configurar Aplicación Python como Servicio systemd

Este documento describe cómo configurar una aplicación Python para que se ejecute como un servicio en sistemas operativos basados en Linux usando systemd. Esto asegurará que la aplicación se inicie automáticamente en el arranque y se reinicie en caso de fallos.

## Crear un Archivo de Unidad systemd

1. **Crea un archivo de servicio systemd** llamado `app-api.service` en el directorio `/etc/systemd/system/` con el siguiente contenido:

    ```ini
    [Unit]
    Description=Mi aplicación API Python
    After=network.target

    [Service]
    User=miusuario
    WorkingDirectory=/ruta/a/tu/aplicacion
    ExecStart=/usr/bin/python3 /ruta/a/tu/aplicacion/app-api.py
    Restart=always
    Environment="VARIABLE1=valor1" "VARIABLE2=valor2"

    [Install]
    WantedBy=multi-user.target
    ```

   Reemplaza `miusuario` con el nombre de usuario que deseas que ejecute el servicio, `/ruta/a/tu/aplicacion` por la ruta real a tu script y ajusta la ruta al ejecutable de Python si es necesario.

2. **Recarga los daemons systemd** para que reconozcan tu nuevo archivo de servicio:

    ```bash
    sudo systemctl daemon-reload
    ```

## Habilitar y Arrancar el Servicio

1. **Habilita el servicio** para que se inicie automáticamente en el arranque del sistema:

    ```bash
    sudo systemctl enable app-api.service
    ```

2. **Arranca el servicio** con el siguiente comando:

    ```bash
    sudo systemctl start app-api.service
    ```

## Comandos Útiles

- **Verificar el estado del servicio**:

    ```bash
    sudo systemctl status app-api.service
    ```

- **Ver los logs del servicio** para diagnóstico y monitoreo:

    ```bash
    sudo journalctl -u app-api.service
    ```

## Consideraciones Adicionales

- Asegúrate de que el usuario bajo el cual se ejecuta el servicio tiene los permisos necesarios para ejecutar la aplicación.
- Ajusta las dependencias del servicio en el parámetro `After=` si tu aplicación depende de otros servicios.
- Define las variables de entorno necesarias directamente en el archivo de servicio si es requerido.

Este método te permitirá mantener tu aplicación Python funcionando continuamente en el fondo como un servicio del sistema.
