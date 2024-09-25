const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

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

async function addUser(client, userData) {
    const usersCollection = client.db().collection("users");

    // Verificar si ya existe un usuario con ese email
    const existingUser = await usersCollection.findOne({ email: userData.email });
    if (existingUser) {
        console.log("User already exists with email:", userData.email);
        return; // Termina temprano si el usuario ya existe
    }

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
            email: "carlos.badenes@upm.es",
            password: "upm2024",
            name: "Carlos Badenes-Olmedo"
        };
        await addUser(client, userData);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
