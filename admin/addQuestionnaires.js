const { MongoClient } = require('mongodb');
const fs = require('fs');

// Cambiar la URI para usar el usuario específico de la base de datos
async function connectDB() {
    const uri = "mongodb://myuser:mypassword@localhost:27017/queria"; // Usa el usuario y contraseña de la base de datos
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        return client;
    } catch (e) {
        console.error("Could not connect to MongoDB", e);
    }
}

async function addQuestionnaire(client, questionnaireData) {
    const questionnairesCollection = client.db().collection("questionnaires");

    // Verificar si ya existe un cuestionario con ese ID
    const existingQuestionnaire = await questionnairesCollection.findOne({ _id: questionnaireData._id });
    if (existingQuestionnaire) {
        console.log("Questionnaire already exists with id:", questionnaireData.id);
        return; // Termina temprano si el cuestionario ya existe
    }

    // Insertar el cuestionario en la colección
    const result = await questionnairesCollection.insertOne(questionnaireData);
    console.log(`New questionnaire added with the following id: ${result.insertedId}`);
}

async function main() {
    const client = await connectDB();
    if (!client) {
        return;
    }

    try {
        // Leer y parsear el archivo questionnaires.json
        const questionnairesData = JSON.parse(fs.readFileSync('questionnaires.json', 'utf8'));

        // Insertar cada cuestionario en la base de datos
        for (const questionnaire of questionnairesData) {
            await addQuestionnaire(client, questionnaire);
        }
    } finally {
        await client.close();
    }
}

main().catch(console.error);
