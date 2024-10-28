from pymongo import MongoClient
from flask import current_app as app
from pymongo.errors import ConnectionFailure

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
        res = list(mongo_db.db.questionnaires.find({"email": email}, {'_id': 0}))
        return res

    @staticmethod
    def get_questionnaire(email, id):
        # Buscar cuestionarios por email
        return list(mongo_db.db.questionnaires.find({"email": email, "id":id}, {'_id': 0}))

class Question:

    @staticmethod
    def get_questions(qid):
        # Buscar preguntas por cuestionario y email
        res = list(mongo_db.db.questions.find({"qid":qid}, {'_id': 0}))
        return res
