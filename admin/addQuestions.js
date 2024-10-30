const { MongoClient } = require('mongodb');
const fs = require('fs');

// Conectar a la base de datos
async function connectDB() {
    const uri = "mongodb://myuser:mypassword@localhost:27017/mydatabase"; // Ajusta con tus credenciales
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        return client;
    } catch (e) {
        console.error("Could not connect to MongoDB", e);
    }
}

async function addQuestion(client, questionData) {
    const questionsCollection = client.db().collection("questions");

    // Verificar si ya existe una pregunta con ese ID
    const existingQuestion = await questionsCollection.findOne({ _id: questionData._id });
    if (existingQuestion) {
        console.log("Question already exists with id:", questionData.id);
        return; // Termina temprano si la pregunta ya existe
    }

    // Insertar la pregunta en la colección
    const result = await questionsCollection.insertOne(questionData);
    console.log(`New question added with the following id: ${result.insertedId}`);
}

async function main() {
    const client = await connectDB();
    if (!client) {
        return;
    }

    try {
        // Leer y parsear el archivo questions.json
        const questionsData = JSON.parse(fs.readFileSync('questions.json', 'utf8'));

        // Insertar cada pregunta en la base de datos
        for (const question of questionsData) {
            await addQuestion(client, question);
        }
    } finally {
        await client.close();
    }
}

main().catch(console.error);
