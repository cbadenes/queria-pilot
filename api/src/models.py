from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from flask import current_app as app
from pymongo.errors import ConnectionFailure
from datetime import datetime
import hashlib

class MongoDB:
    def __init__(self):
        self.client = None
        self.db = None

    def init_app(self):
        try:
            uri = app.config['MONGO_URI']
            self.client = MongoClient(uri)
            self.db = self.client.get_default_database()
        except ConnectionFailure as e:
            print("Could not connect to MongoDB:", e)

mongo_db = MongoDB()

class User:
    @staticmethod
    def find_user_by_email(email):
        # Buscar usuario por email
        return mongo_db.db.users.find_one({"email": email})

    @staticmethod
    def create_user(user_data):
        # Verificar si el usuario ya existe
        existing_user = User.find_user_by_email(user_data['email'])
        if existing_user:
            # Si el usuario ya existe, devuelve None o maneja como veas adecuado
            return None
        # Si no existe, crea un nuevo usuario
        return mongo_db.db.users.insert_one(user_data)

class Questionnaire:

    @staticmethod
    def get_questionnaires(email):
        # Buscar cuestionarios por email
        questionnaires = list(mongo_db.db.questionnaires.find({"email": email}))
        for q in questionnaires:
            q['id'] = str(q.pop('_id'))
        return questionnaires

    @staticmethod
    def get_questionnaire(email, id):
        # Buscar cuestionarios por email
        return list(mongo_db.db.questionnaires.find({"email": email, "_id":id}))

    @staticmethod
    def create_questionnaire(name, email, filename, difficulty, num_questions, ratio):
        # Generar un identificador único para el cuestionario
        unique_string = f"{name}_{email}".encode('utf-8')
        questionnaire_id = hashlib.md5(unique_string).hexdigest()

        questionnaire_data = {
            "_id": questionnaire_id,
            "name": name,
            "filename": filename,
            "date": datetime.now(),
            "status": "scheduled",
            "email": email,
            "difficulty": difficulty,
            "num_questions": num_questions,
            "ratio": ratio
        }
        try:
            result = mongo_db.db.questionnaires.insert_one(questionnaire_data)
            questionnaire_data["id"] = str(questionnaire_data["_id"])
            app.logger.info(f"New questionnaire created : {questionnaire_data}")
            return questionnaire_data
        except DuplicateKeyError:
            app.logger.error(f"Error por cuestionario duplicado: {questionnaire_id}")
            return {}

class Question:

    @staticmethod
    def get_questions(qid):
        # Buscar preguntas por cuestionario y email
        questions = list(mongo_db.db.questions.find({"qid":qid}))
        for q in questions:
            q['id'] = str(q.pop('_id'))
        return questions
