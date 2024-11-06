from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from flask import current_app as app
from pymongo.errors import ConnectionFailure
from datetime import datetime
import hashlib
import logging

logger = logging.getLogger('queriaWorker')
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
    def get_questionnaire(id):
        # Buscar cuestionarios por email
        return mongo_db.db.questionnaires.find_one({"_id":id})

    @staticmethod
    def delete_questionnaire(id):
        questions_result = mongo_db.db.questions.delete_many({"qid":id})
        questionnaire_result = mongo_db.db.questionnaires.delete_one({"_id":id})
        return {
            "deleted_questions": questions_result.deleted_count,
            "questionnaire_deleted": questionnaire_result.deleted_count > 0
        }

    @staticmethod
    def update_status(qid, new_status):
        result = mongo_db.db.questionnaires.update_one(
            {'_id': qid},  # Asegúrate de que '_id' es el campo correcto usado para identificar el cuestionario
            {'$set': {'status': new_status}}
        )
        return result.modified_count

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

    @staticmethod
    def create_question(qid, question, difficulty, type, context, answers, valid_answer, evidence):
        # Generar un identificador único para el cuestionario
        unique_string = f"{qid}_{question}_{valid_answer}_{context}".encode('utf-8')
        question_id = hashlib.md5(unique_string).hexdigest()

        question_data = {
            "_id": question_id,
            "qid": qid,
            "question": question,
            "date": datetime.now(),
            "difficulty": difficulty,
            "type": type,
            "context": context,
            "answers": answers,
            "valid_answer":valid_answer,
            "evidence":evidence,
            "responses":[]
        }
        try:
            result = mongo_db.db.questions.insert_one(question_data)
            question_data["id"] = str(question_data["_id"])
            logger.info(f"New question created : {question_data}")
            return question_data
        except DuplicateKeyError:
            logger.error(f"Error por pregunta duplicada: {question_id}")
            return {}