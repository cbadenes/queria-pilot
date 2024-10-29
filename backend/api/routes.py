from flask import Flask, Blueprint, request, jsonify, make_response, g
from flask import current_app as app
from flask_jwt_extended import create_access_token
from werkzeug.utils import secure_filename
import os
from .utils import extract_questions
from .models import User, Questionnaire, Question
import bcrypt
import uuid
import json
import dicttoxml

api_blueprint = Blueprint('api', __name__)

# CORS
headers = {'Access-Control-Allow-Origin': '*'}

def init_routes(app):
    @app.before_request
    def before_request_logging():
        # Genera un identificador único para la solicitud y guárdalo en el contexto de la solicitud
        g.request_id = str(uuid.uuid4())
        app.logger.info('[%s] Received request: %s %s', g.request_id, request.method, request.url)
        app.logger.debug('[%s] Headers: %s', g.request_id, request.headers)
        app.logger.debug('[%s] Body: %s', g.request_id, request.get_data(as_text=True))


    @app.after_request
    def after_request_logging(response):
        app.logger.info('[%s] Response status: %s', g.request_id, response.status)
        app.logger.debug('[%s] Response data: %s', g.request_id, response.get_data(as_text=True))
        return response


@api_blueprint.route('/login', methods=['POST'])
def login():
    user_data = request.get_json()
    user = User.find_user_by_email(user_data['email'])

    if user and 'password' in user:
        password_encoded = user_data['password'].encode('utf-8')
        hashed_password = user['password'].encode('utf-8')

        if bcrypt.checkpw(password_encoded, hashed_password):
            print("Login successful for:", user['email'])
            access_token = create_access_token(identity=user['email'])
            return jsonify(access_token=access_token), 200, headers
        else:
            print("Invalid password for:", user['email'])
    else:
        return jsonify({"message": "User not found"}), 401, headers

@api_blueprint.route('/questionnaires', methods=['GET'])
def get_questionnaires():
    email = request.args.get('email')  # Obtener el email del parámetro de la consulta
    if not email:
        return jsonify({"error": "Email is required"}), 400, headers

    questionnaires = Questionnaire.get_questionnaires(email)

    if (len(questionnaires)>0):
        return jsonify({"questionnaires": questionnaires}), 200, headers
    else:
        return jsonify({"questionnaires": []}), 200, headers

@api_blueprint.route('/questionnaires/<id>', methods=['GET'])
def get_questions(id):
    questions = Question.get_questions(id)
    if len(questions)>0:
        return jsonify(questions), 200, headers
    else:
        return jsonify({"error": "Questionnaire not found"}), 404, headers

@api_blueprint.route('/questionnaires', methods=['POST'])
def create_questionnaire():
    try:
        # Verificar si el archivo PDF fue enviado
        if 'pdf' not in request.files:
            app.logger.error("No PDF file provided")
            return jsonify({"error": "No PDF file provided"}), 400, headers

        pdf_file = request.files['pdf']
        if pdf_file.filename == '':
            app.logger.error("No selected file")
            return jsonify({"error": "No selected file"}), 400, headers

        # Guardar el archivo PDF en una ubicación temporal
        filename = secure_filename(pdf_file.filename)
        pdf_path = os.path.join('/tmp', filename)
        pdf_file.save(pdf_path)
        app.logger.info(f"Archivo PDF guardado temporalmente en: {pdf_path}")

        # Extraer los datos enviados en la solicitud
        num_questions = request.form.get('numQuestions', type=int)
        difficulty = request.form.get('difficulty')
        percentage_free_response = request.form.get('percentageFreeResponse', type=int)
        questionnaire_name = request.form.get('name')
        user_email = request.form.get('email')

        app.logger.debug(f"Datos recibidos: numQuestions={num_questions}, difficulty={difficulty}, percentageFreeResponse={percentage_free_response}, name={questionnaire_name}, email={user_email}")

        # Verificar que todos los campos sean válidos
        if not all([num_questions, difficulty, percentage_free_response, questionnaire_name, user_email]):
            app.logger.error("Faltan datos en la solicitud")
            return jsonify({"error": "Missing form data"}), 400, headers

        # Generar un identificador único para el cuestionario
        questionnaire_id = str(uuid.uuid4())

        # Procesar el archivo PDF y extraer preguntas (esta función debe estar en utils.py)
        try:
            questions = extract_questions(pdf_path)
            app.logger.info(f"Preguntas extraídas del PDF: {questions}")

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
            app.logger.info(f"Archivo PDF temporal eliminado: {pdf_path}")

            # Respuesta exitosa
            return jsonify({
                "id": questionnaire_id,
                "name": questionnaire_name,
                "status": "en_construccion"  # Estado inicial
            }), 200, headers

        except Exception as e:
            app.logger.error(f"Error procesando el archivo PDF: {str(e)}")
            return jsonify({"error": str(e)}), 500, headers

    except Exception as e:
        app.logger.error(f"Error general en la creación del cuestionario: {str(e)}")
        return jsonify({"error": str(e)}), 500, headers

@api_blueprint.route('/evaluate', methods=['POST'])
def evaluate():
    # Se reciben los datos de la pregunta y respuesta del frontend
    data = request.json
    question_id = data.get('questionId')
    user_response = data.get('response')
    context = data.get('context')

    # lógica de evaluación de la respuesta
    score = 75  # Este valor es un ejemplo
    explanation = "Bien hecho, tu respuesta es parcialmente correcta."

    # Devolver puntuación y explicación como respuesta
    return jsonify({"score": score, "explanation": explanation, "message": "Evaluación completada."}), 200, headers

@api_blueprint.route('/comments', methods=['POST'])
def handle_comments():
    data = request.get_json()
    print("Comentario recibido:", data)  # Imprime el comentario para fines de depuración
    # Aquí puedes agregar código para procesar y almacenar el comentario en tu base de datos o sistema de archivos

    # Devuelve un mensaje de confirmación
    return jsonify({"message": "Tu comentario ha quedado registrado"}), 200, headers

@api_blueprint.route('/export/moodle', methods=['POST'])
def export_moodle():
    data = request.json
    questionnaire_id = data.get('questionnaireId')
    questions = Question.get_questions(questionnaire_id)
    print("Questionnaire Info:", questions)
    xml = dicttoxml.dicttoxml(questions)
    print("Xml: ", xml)
    response = make_response(xml)
    print("Response: ", response)
    response.headers['Content-Type'] = 'application/xml'
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@api_blueprint.route('/results', methods=['POST'])
def evaluate_results():
    data = request.get_json()
    questionnaire_id = data.get('questionnaireId')
    answers = data.get('answers')
    # cambiar estado de cuestionario a "completed"
    print("QuestionnaireID: ",questionnaire_id )
    print("Answers:", answers)


    # Lógica para evaluar las respuestas
    # Por ejemplo, comprobar respuestas correctas y calcular una puntuación
    correct_answers = {
        'question1': 'respuesta1',
        'question2': 'respuesta2',
        # Asumir que 'correct_answers' contiene las respuestas correctas de cada pregunta
    }

    score = 0
    total_questions = len(answers)
    for question_id, user_answer in answers.items():
        if user_answer == correct_answers.get(question_id):
            score += 1

    result_score = (score / total_questions) * 100  # Calcular la puntuación como un porcentaje

    # Devolver el resultado de la evaluación
    if result_score > 50:
        return jsonify({"message": "¡Buen trabajo! Has aprobado el cuestionario.", "score": result_score}), 200
    else:
        return jsonify({"message": "Necesitas mejorar. Intenta nuevamente el cuestionario.", "score": result_score}), 200