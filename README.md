
# QuerIA - Questionnaire Generator

QuerIA es una plataforma avanzada que utiliza tecnología de Procesamiento de Lenguaje Natural para generar cuestionarios automáticamente a partir de documentos PDF. Esta herramienta está diseñada para facilitar la creación de cuestionarios educativos, permitiendo a los usuarios cargar documentos, configurar parámetros y recibir cuestionarios listos para usar con validación en tiempo real de las respuestas.

## Características Principales

- **Registro y autenticación de usuarios**: Acceso seguro y personalizado.
- **Carga y análisis de documentos PDF**: Transforma contenido de documentos en cuestionarios interactivos.
- **Personalización de cuestionarios**: Configura número de preguntas, dificultad y tipos.
- **Validación en tiempo real**: Responde y obtén retroalimentación instantánea.
- **Exportación de resultados**: Exporta tus cuestionarios y respuestas en formato PDF para fácil acceso y revisión.

## Tecnologías Utilizadas

- **Frontend**: Desarrollado con React y React Router para una experiencia de usuario dinámica.
- **Backend**: Python con Flask proporciona una API robusta y escalable.
- **Base de datos**: Flexible integración con PostgreSQL o MongoDB.
- **Autenticación**: Seguridad mediante JWT (JSON Web Tokens).

## Configuración y Ejecución

### Prerrequisitos

Asegúrate de tener instalado Node.js, npm (o yarn), Python 3 y Pipenv para manejar las dependencias de Python.

### Instalación y Configuración del Entorno

1. **Clonación del repositorio y configuración del backend**:
    ```bash
    git clone https://github.com/tu_usuario/QuerIA.git
    cd QuerIA/backend
    pip install -r requirements.txt
    python app-api.py
    ```

2. **Configuración del frontend**:
    ```bash
    cd ../frontend
    npm install
    npm start
    ```

### Puesta en Marcha de los Servicios con Docker

Si prefieres usar Docker para la configuración del entorno:
```bash
docker-compose up -d
```
Visita `http://localhost:3000` para acceder a la aplicación.

## Uso

Regístrate y sigue las instrucciones para cargar un documento PDF y generar tu cuestionario. Puedes ajustar la configuración del cuestionario según tus necesidades antes de la generación.

## Contribuciones

Contribuciones al proyecto son bienvenidas. Para contribuir, por favor realiza un pull request o abre un issue para discutir tus ideas o cambios propuestos.

## Licencia

Este proyecto está licenciado bajo MIT. Consulta el archivo `LICENSE` para más detalles.
