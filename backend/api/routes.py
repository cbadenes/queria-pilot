from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.utils import secure_filename
import os
from .utils import extract_questions
from .models import User
import bcrypt
import uuid
import logging  # Añadir logs para ayudar en la depuración

api_blueprint = Blueprint('api', __name__)

# Configurar logging para depuración
logging.basicConfig(level=logging.DEBUG)

@api_blueprint.route('/login', methods=['POST'])
def login():
    print("login input")
    user_data = request.get_json()
    user = User.find_user_by_email(user_data['email'])
    # Asegúrate de que 'user' es un diccionario y accede a 'password_hash' como una clave
    if user and 'password' in user:
        password_encoded = user_data['password'].encode('utf-8')
        hashed_password = user['password'].encode('utf-8')

        if bcrypt.checkpw(password_encoded, hashed_password):
            print("Login successful for:", user['email'])
            access_token = create_access_token(identity=user['email'])
            return jsonify(access_token=access_token), 200
        else:
            print("Invalid password for:", user['email'])
    else:
        return jsonify({"message": "User not found"}), 401

@api_blueprint.route('/questionnaires', methods=['GET'])
def get_questionnaires():
    # Datos de ejemplo
    questionnaires = [
        {"name": "Datos Abiertos", "status": "scheduled", "id":"Q1"},
        {"name": "Diagramas de Clase", "status": "in_progress", "id":"Q2"},
        {"name": "Datos Complejos", "status": "completed", "id":"Q3"}
    ]
    return jsonify(questionnaires=questionnaires)

@api_blueprint.route('/questionnaires/<id>', methods=['GET'])
def get_questionnaire_details(id):
    # Data for example purposes (replace with actual database query logic)
    questionnaires = {
        "Q1": [],
        "Q3": [
            {
                "id": "q1.1",
                "date": "2024-09-20",
                "questionnerId": "q1",
                "type": "multi",
                "question": "What is AI?",
                "available_answers": ["A type of software", "A new technology", "A robot"],
                "valid_answer": "A type of software"
            },
            {
                "id": "q1.2",
                "date": "2024-09-20",
                "questionnerId": "q1",
                "type": "multi",
                "question": "What is AI?",
                "available_answers": ["A type of software", "A new technology", "A robot"],
                "valid_answer": "A type of software"
            }
        ],
        "Q2": [
            {
                "id": "q2.1",
                "date": "2024-09-21",
                "questionnerId": "q2",
                "type": "open",
                "question": "Explain how machine learning works.",
                "available_answers": [],
                "valid_answer": ""
            },
            {
                "id": "q2.2",
                "date": "2024-09-21",
                "questionnerId": "q2",
                "type": "open",
                "question": "Explain how machine learning works.",
                "available_answers": [],
                "valid_answer": ""
            }
        ]
    }

    # Find the questionnaire by id
    questionnaire = questionnaires.get(id)

    if questionnaire:
        return jsonify(questionnaire), 200
    else:
        return jsonify({"error": "Questionnaire not found"}), 404

@api_blueprint.route('/questionnaires', methods=['POST'])
def create_questionnaire():
    try:
        # Verificar si el archivo PDF fue enviado
        if 'pdf' not in request.files:
            logging.error("No PDF file provided")
            return jsonify({"error": "No PDF file provided"}), 400

        pdf_file = request.files['pdf']
        if pdf_file.filename == '':
            logging.error("No selected file")
            return jsonify({"error": "No selected file"}), 400

        # Guardar el archivo PDF en una ubicación temporal
        filename = secure_filename(pdf_file.filename)
        pdf_path = os.path.join('/tmp', filename)
        pdf_file.save(pdf_path)
        logging.info(f"Archivo PDF guardado temporalmente en: {pdf_path}")

        # Extraer los datos enviados en la solicitud
        num_questions = request.form.get('numQuestions', type=int)
        difficulty = request.form.get('difficulty')
        percentage_free_response = request.form.get('percentageFreeResponse', type=int)
        questionnaire_name = request.form.get('name')
        user_email = request.form.get('email')

        logging.debug(f"Datos recibidos: numQuestions={num_questions}, difficulty={difficulty}, percentageFreeResponse={percentage_free_response}, name={questionnaire_name}, email={user_email}")

        # Verificar que todos los campos sean válidos
        if not all([num_questions, difficulty, percentage_free_response, questionnaire_name, user_email]):
            logging.error("Faltan datos en la solicitud")
            return jsonify({"error": "Missing form data"}), 400

        # Generar un identificador único para el cuestionario
        questionnaire_id = str(uuid.uuid4())

        # Procesar el archivo PDF y extraer preguntas (esta función debe estar en utils.py)
        try:
            questions = extract_questions(pdf_path)
            logging.info(f"Preguntas extraídas del PDF: {questions}")

            # Aquí puedes añadir lógica adicional para construir el cuestionario
            questionnaire = {
                "id": questionnaire_id,
                "name": questionnaire_name,
                "num_questions": num_questions,
                "difficulty": difficulty,
                "percentage_free_response": percentage_free_response,
                "email": user_email,
                "status": "en_construccion",  # Estado inicial del cuestionario
                "questions": questions
            }

            # Eliminar el archivo temporal después de su uso
            os.remove(pdf_path)
            logging.info(f"Archivo PDF temporal eliminado: {pdf_path}")

            # Respuesta exitosa
            return jsonify({
                "id": questionnaire_id,
                "name": questionnaire_name,
                "status": "en_construccion"  # Estado inicial
            }), 200

        except Exception as e:
            logging.error(f"Error procesando el archivo PDF: {str(e)}")
            return jsonify({"error": str(e)}), 500

    except Exception as e:
        logging.error(f"Error general en la creación del cuestionario: {str(e)}")
        return jsonify({"error": str(e)}), 500
