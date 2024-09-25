# Añadir Usuarios a MongoDB con Node.js

Este proyecto contiene un script simple para añadir usuarios a una base de datos MongoDB usando Node.js y el módulo `bcrypt` para hashear contraseñas. A continuación, se describen los pasos para configurar y ejecutar el script.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- Node.js
- MongoDB ejecutándose en tu máquina local

## Configuración del Proyecto

1. **Crear un Nuevo Directorio**: Crea un nuevo directorio para tu proyecto y navega a él desde tu terminal.
2. **Inicializar NPM**: Ejecuta `npm init -y` para crear un archivo `package.json` automáticamente.
3. **Instalar Dependencias**: Necesitas instalar dos paquetes, `mongodb` para interactuar con la base de datos MongoDB y `bcrypt` para hashear las contraseñas:
   ```bash
   npm install mongodb bcrypt
   ```
## Archivo addUser.js

   ```javascript
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function connectDB() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        return client;
    } catch (e) {
        console.error("Connection to MongoDB failed", e);
    }
}

async function addUser(client, userData) {
    const usersCollection = client.db("mydatabase").collection("users");
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userDocument = {
        email: userData.email,
        password: hashedPassword,
        name: userData.name
    };
    const result = await usersCollection.insertOne(userDocument);
    console.log(`New user added with the following id: ${result.insertedId}`);
}

async function main() {
    const client = await connectDB();
    if (!client) {
        return;
    }

    try {
        const userData = {
            email: "user@example.com",
            password: "password123",
            name: "John Doe"
        };
        await addUser(client, userData);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
   ```

## Ejecutar el script

Para ejecutar el script y añadir un usuario, simplemente ejecuta el siguiente comando en tu terminal:

````shell
node addUser.js
````
Este script conectará a MongoDB, hasheará la contraseña proporcionada y añadirá un nuevo usuario a la colección users.

## Notas Adicionales

- Asegúrate de que MongoDB está ejecutándose antes de iniciar el script.
- Puedes modificar los datos del usuario directamente en el script para añadir diferentes usuarios.