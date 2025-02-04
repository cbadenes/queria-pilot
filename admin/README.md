# Sistema de Gestión de Usuarios para QuerIA

Este sistema permite gestionar usuarios en una base de datos MongoDB a través de un archivo de texto, automatizando la creación de usuarios y el reseteo de contraseñas con envío automático por email.

## Características

- Gestión de usuarios desde archivo de texto
- Generación segura de contraseñas
- Envío automático de credenciales por email
- Sistema de logging completo
- Validación de usuarios existentes
- Manejo de errores robusto

## Requisitos Previos

1. Python 3.7 o superior
2. MongoDB instalado y en ejecución
3. Cuenta de correo SMTP para envío de emails

## Instalación

1. Clonar el repositorio o descargar los archivos

2. Instalar las dependencias necesarias:
```bash
pip install pymongo bcrypt
```

3. Configurar las variables de entorno (opcional):
```bash
export MONGO_URI="mongodb://myuser:mypassword@localhost:27017/queria"
export SMTP_USER="tu_email@gmail.com"
export SMTP_PASSWORD="tu_password_app"
```

## Configuración

### Base de Datos

El script espera una conexión MongoDB. Puedes configurar la URI de conexión de dos formas:

1. Directamente en el código:
```python
mongo_uri = "mongodb://myuser:mypassword@localhost:27017/queria"
```

2. Mediante variable de entorno:
```python
mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/queria')
```

### Configuración SMTP

Configura los detalles de tu servidor SMTP en el diccionario `smtp_config`:

```python
smtp_config = {
    'server': 'smtp.gmail.com',  # O tu servidor SMTP
    'port': 587,
    'user': 'tu_email@gmail.com',
    'password': 'tu_password_app'
}
```

**Nota para Gmail**: Si usas Gmail, necesitarás generar una "Contraseña de aplicación" en la configuración de seguridad de tu cuenta.

## Archivo de Usuarios

Crear un archivo `users.txt` con el siguiente formato:

```
email,nombre,acción
```

Donde:
- `email`: Dirección de correo del usuario
- `nombre`: Nombre completo del usuario
- `acción`: Puede ser "new" o "reset"

Ejemplo:
```
juan.perez@queria.es,Juan Pérez,new
maria.garcia@queria.es,María García,reset
```

## Uso

1. Prepara el archivo `users.txt` con los usuarios a procesar

2. Ejecuta el script:
```bash
python user_management.py
```

El script:
- Leerá el archivo `users.txt`
- Procesará cada usuario según la acción especificada
- Generará contraseñas seguras
- Enviará emails con las credenciales
- Registrará todas las operaciones en el log

## Logs

El script genera logs detallados de todas las operaciones. Los logs incluyen:
- Timestamp
- Nivel de log (INFO, WARNING, ERROR)
- Mensaje descriptivo

Ejemplo de salida de log:
```
2025-02-04 10:15:23,456 - INFO - Conexión exitosa a MongoDB
2025-02-04 10:15:23,789 - INFO - Usuario creado: juan.perez@queria.es
2025-02-04 10:15:24,123 - INFO - Email enviado exitosamente a juan.perez@queria.es
```

## Seguridad

- Las contraseñas generadas cumplen con requisitos de seguridad (mayúsculas, minúsculas, números y caracteres especiales)
- Las contraseñas se almacenan hasheadas usando bcrypt
- La comunicación con el servidor SMTP usa TLS
- Las credenciales sensibles pueden configurarse mediante variables de entorno

## Solución de Problemas

### Error de Conexión a MongoDB
```
Error al conectar a MongoDB: connection refused
```
Verifica que:
- MongoDB está en ejecución
- La URI de conexión es correcta
- El usuario tiene permisos adecuados

### Error de Envío de Email
```
Error al enviar email: authentication failed
```
Verifica que:
- Las credenciales SMTP son correctas
- Si usas Gmail, has generado una contraseña de aplicación
- El servidor SMTP es accesible desde tu red

## Contribuir

Si encuentras un bug o tienes una sugerencia, por favor:
1. Revisa los issues existentes
2. Crea un nuevo issue con una descripción detallada
3. Para cambios mayores, crea primero un issue para discutir los cambios

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.