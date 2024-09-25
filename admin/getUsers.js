const { MongoClient } = require('mongodb');

// Cambiar la URI para usar el usuario específico de la base de datos
async function connectDB() {
    const uri = "mongodb://myuser:mypassword@localhost:27017/mydatabase"; // Usa el usuario y contraseña de la base de datos
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        return client;
    } catch (e) {
        console.error("Could not connect to MongoDB", e);
    }
}

async function listUsers(client) {
    const usersCollection = client.db().collection("users");

    try {
        const users = await usersCollection.find({}).toArray(); // Consulta para obtener todos los usuarios
        if (users.length > 0) {
            console.log("Existing users:");
            users.forEach(user => {
                console.log(`Email: ${user.email}, Name: ${user.name}`);
            });
        } else {
            console.log("No users found.");
        }
    } catch (e) {
        console.error("Error retrieving users:", e);
    }
}

async function main() {
    const client = await connectDB();
    if (!client) {
        return;
    }

    try {
        await listUsers(client);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
