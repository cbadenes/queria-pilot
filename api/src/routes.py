from flask import Flask, Blueprint, request, jsonify, make_response, g
from flask import current_app as app
from flask_jwt_extended import create_access_token
from werkzeug.utils import secure_filename
import os
from .models import User, Questionnaire, Question, Comment
from .chats import Conversation
from .events import Ticket
import bcrypt
import uuid
import json
import dicttoxml
from PyPDF2 import PdfReader
import random
from pika import BlockingConnection, ConnectionParameters
import xml.etree.ElementTree as ET



api_blueprint = Blueprint('api', __name__)

# CORS
headers = {'Access-Control-Allow-Origin': '*'}

def init_routes(app):
    @app.before_request
    def before_request_logging():
        # Genera un identificador único para la solicitud y guárdalo en el contexto de la solicitud
        g.request_id = str(uuid.uuid4())
        app.logger.info('[%s] Received request: %s %s', g.request_id, request.method, request.url)
        #app.logger.debug('[%s] Body: %s', g.request_id, request.get_data(as_text=True))


    @app.after_request
    def after_request_logging(response):
        app.logger.info('[%s] Response status: %s', g.request_id, response.status)
        app.logger.debug('[%s] Response data: %s', g.request_id, response.get_data(as_text=True))
        return response


@api_blueprint.route('/login', methods=['POST'])
def login():
    app.logger.info('[%s] Headers: %s', g.request_id, request.headers)
    user_data = request.get_json()
    user = User.find_user_by_email(user_data['email'])

    if user and 'password' in user:
        password_encoded = user_data['password'].encode('utf-8')
        hashed_password = user['password'].encode('utf-8')

        if bcrypt.checkpw(password_encoded, hashed_password):
            access_token = create_access_token(identity=user['email'])
            return jsonify(access_token=access_token), 200, headers
        else:
            app.logger.info(f"Invalid password for: {user_data}")
    else:
        return jsonify({"message": "Usuario Desconocido"}), 401, headers

@api_blueprint.route('/questionnaires', methods=['GET'])
def get_questionnaires():
    email = request.args.get('email')  # Obtener el email del parámetro de la consulta
    if not email:
        return jsonify({"error": "Email is required"}), 400, headers

    questionnaires = Questionnaire.get_questionnaires(email)
    return jsonify(questionnaires), 200, headers

@api_blueprint.route('/questionnaires/<id>/questions', methods=['GET'])
def get_questions(id):
    questions = Question.get_questions(id)
    if len(questions)>0:
        return jsonify(questions), 200, headers
    else:
        return jsonify({"error": "Cuestionario Inválido"}), 404, headers

@api_blueprint.route('/questionnaires/<id>', methods=['DELETE'])
def delete_questionnaire(id):

    response = Questionnaire.delete_questionnaire(id)

    if response['questionnaire_deleted']:
        return jsonify(response), 200, headers
    else:
        return jsonify({"error": "Cuestionario Inválido"}), 404, headers

@api_blueprint.route('/questionnaires', methods=['POST'])
def create_questionnaire():
    try:
        # Verificar si el archivo PDF fue enviado
        if 'pdf' not in request.files:
            app.logger.error("No PDF file provided")
            return jsonify({"error": "No se ha adjuntado ningún PDF"}), 400, headers

        pdf_file = request.files['pdf']
        if pdf_file.filename == '':
            app.logger.error("No selected file")
            return jsonify({"error": "Nombre de archivo incorrecto"}), 400, headers

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
            return jsonify({"error": "Faltan datos obligatorios del cuestionario"}), 400, headers

        # Almacenar cuestionario en BBDD
        questionnaire = Questionnaire.create_questionnaire(questionnaire_name, user_email, pdf_file.filename, difficulty, num_questions, percentage_free_response)
        if 'id' not in questionnaire:
            return jsonify({"error": "El nombre del cuestionario ya existe"}), 400, headers
        # Procesar el archivo PDF
        parts = []
        try:
            reader = PdfReader(pdf_path)
            text = ''
            for page in reader.pages:
                text += page.extract_text() if page.extract_text() else ''

            # Dividir el texto en partes de 1024 caracteres
            parts = [text[i:i+1024] for i in range(0, len(text), 1024)]
        except Exception as e:
            app.logger.error(f"Error procesando el PDF: {e}")
            return jsonify({"error": "No se pudo procesar el PDF"}), 500, headers

        app.logger.debug(f"{len(parts)} parts created")

        # Seleccionar aleatoriamente `num_questions` partes de texto
        selected_parts = random.sample(parts, k=num_questions)
        app.logger.debug(f"Parts selected: {selected_parts}")

        # Enviar eventos a ActiveMQ
        for part in selected_parts:
            Ticket.create_question_event(
                context=part,
                difficulty=questionnaire['difficulty'],
                percentage_free_response=questionnaire['ratio'],
                id=questionnaire['id'],
                email=questionnaire['email']
            )

        return jsonify(questionnaire), 200, headers

    except Exception as e:
        app.logger.error(f"Error durante la creación del cuestionario: {str(e)}")
        app.logger.error(f"Detalles del error:\n {traceback.format_exc()}")
        # eliminar cuestionario en bbdd
        return jsonify({"error": str(e)}), 500, headers

@api_blueprint.route('/evaluate', methods=['POST'])
def evaluate():
    try:
        # Se reciben los datos de la pregunta y respuesta del frontend
        data = request.json
        app.logger.debug(f"Evaluate the following response: {data}")
        question_id = data.get('questionId')
        question_text = data.get('question')
        difficulty = data.get('difficulty')
        user_response = data.get('response')
        context = data.get('context')

        # lógica de evaluación de la respuesta
        evaluation = Conversation.evaluate(context, difficulty, question_text, user_response)

        # Devolver puntuación y explicación como respuesta
        return jsonify({"score": evaluation['VALOR'], "explanation": evaluation['TEXTO'], "message": "Evaluación completada."}), 200, headers
    except Exception as e:
        app.logger.error(f"Error durante la evaluación: {str(e)}")
        app.logger.error(f"Detalles del error:\n {traceback.format_exc()}")
        # eliminar cuestionario en bbdd
        return jsonify({"error": str(e)}), 500, headers

@api_blueprint.route('/comments', methods=['POST'])
def handle_comments():
    try:
        data = request.get_json()
        app.logger.debug(f"Comentario recibido: {data}")  # Imprime el comentario para fines de depuración

        question_id = data['id']
        questionnaire_id = data['qid']
        level_difficulty = data['ratings']['difficulty']
        level_writing = data['ratings']['writing']
        level_relevance = data['ratings']['relevance']
        comment = data['comment']

        Comment.create_comment(questionnaire_id, question_id, comment, level_difficulty, level_writing, level_relevance)
        return jsonify({"message": "¡Muchas Gracias! Tu comentario ha quedado registrado"}), 200, headers
    except Exception as e:
        app.logger.error(f"Error durante la creación del comentario: {str(e)}")
        app.logger.error(f"Detalles del error:\n {traceback.format_exc()}")
        # eliminar cuestionario en bbdd
        return jsonify({"error": str(e)}), 500, headers

@api_blueprint.route('/export/moodle', methods=['POST'])
def export_moodle():
    data = request.json
    questionnaire_id = data.get('questionnaireId')
    questionnaire = Questionnaire.get_questionnaire(questionnaire_id)
    questions = Question.get_questions(questionnaire_id)

    quiz = ET.Element("quiz")

    comment_name = ET.Comment(f' Cuestionario: {questionnaire.get("name")} ')
    quiz.append(comment_name)

    # Añadir cada pregunta al XML
    for question in questions:
        question_element = ET.SubElement(quiz, "question", type="multichoice")

        name = ET.SubElement(question_element, "name")
        ET.SubElement(name, "text").text = question.get("question")

        questiontext = ET.SubElement(question_element, "questiontext", format="html")
        ET.SubElement(questiontext, "text").text = f"<![CDATA[<p>{question.get('question')}</p>]]>"

        # Añadir respuestas
        for answer in question.get("answers", []):
            answer_element = ET.SubElement(question_element, "answer", fraction="100" if answer == question.get("valid_answer") else "0", format="html")
            ET.SubElement(answer_element, "text").text = f"<![CDATA[<p>{answer}</p>]]>"

    # Convertir a string el XML
    xml_str = ET.tostring(quiz, encoding='utf8', method='xml').decode()
    response = make_response(xml_str)
    response.headers['Content-Type'] = 'application/xml'
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response
