# QuerIA - Questionnaire Generator

QuerIA es una aplicación web avanzada diseñada para generar cuestionarios automáticos a partir de documentos PDF utilizando tecnologías de Procesamiento de Lenguaje Natural asistidas por modelos de lenguaje grandes (LLMs). Esta herramienta permite a los usuarios cargar documentos, seleccionar parámetros de generación de cuestionarios y obtener un cuestionario listo para ser respondido con validación en tiempo real de las respuestas.

## Características

- **Registro y autenticación de usuarios**: Seguridad en el acceso a la herramienta.
- **Carga de documentos PDF**: Los usuarios pueden cargar documentos desde los cuales se generarán las preguntas.
- **Configuración del cuestionario**: Los usuarios pueden especificar el número de preguntas, la dificultad y el tipo de preguntas.
- **Interacción en tiempo real**: Generación y validación de respuestas de forma asíncrona y síncrona.
- **Exportación de resultados**: Los usuarios pueden exportar el cuestionario junto con sus respuestas y comentarios en formato PDF.

## Tecnologías Utilizadas

- **Frontend**: React, React Router
- **Backend**: Python con Flask para el API de servidor
- **Base de datos**: PostgreSQL o MongoDB
- **Autenticación**: JWT (JSON Web Tokens)

## Instalación

Sigue los pasos a continuación para configurar el entorno de desarrollo y ejecutar QuerIA localmente.

### Prerrequisitos

- Node.js
- npm o yarn
- Python 3
- Pipenv (opcional, para manejar dependencias de Python)

### Configuración del Backend

1. Clona el repositorio y navega al directorio del backend:
   ```bash
   git clone https://github.com/tu_usuario/QuerIA.git
   cd QuerIA/backend
   ```
2. Instala las dependencias de Python:
    ```bash
    pip install -r requirements.txt
    ```
3. Inicia el servidor de desarrollo:
    ```bash
    python app.py
    ```

### Configuración del Frontend
1. Navega al directorio del frontend desde la raíz del proyecto:
   ```bash
   cd frontend
   ```
2. Instala las dependencias de Node.js:
    ```bash
    nvm install 18
    nvm use 18
    npm install
    npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
    npm install react-dropzone --save
    npm install @react-pdf-viewer/core @react-pdf-viewer/default-layout 
    npm install pdfjs-dist@^2.16.105
    npm install @mui/material @emotion/react @emotion/styled
    npm install react-router-dom
    npm install @mui/material @emotion/react @emotion/styled
    npm install cors
    npm install jspdf html2canvas
    npm install axios




    ```
3. Inicia el servidor de desarrollo de React:
    ```bash
    npm start
    ```

## Uso

Después de iniciar los servidores de backend y frontend, navega a http://localhost:3000 en tu navegador para acceder a la aplicación. Regístrate para crear una cuenta y sigue las instrucciones en pantalla para cargar un PDF y generar un cuestionario.

## Contribuir

QuerIA está en desarrollo activo y apreciamos las contribuciones de la comunidad. Si deseas contribuir al proyecto, por favor envía un pull request o abre un issue para discutir lo que te gustaría cambiar.

## Licencia

