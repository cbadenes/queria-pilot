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
import traceback




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
        hashed_password = user['password']  # La contraseña ya está en bytes en la base de datos

        if bcrypt.checkpw(password_encoded, hashed_password):
            access_token = create_access_token(identity=user['email'])
            return jsonify(access_token=access_token), 200, headers
        else:
            app.logger.info(f"Invalid password for: {user_data}")
            return jsonify({"message": "Contraseña incorrecta"}), 401, headers
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

            # Determinar el tamaño de cada parte dinámicamente
            total_length = len(text)
            if num_questions > 0:
                part_size = max(1, total_length // num_questions)  # Ajustar el tamaño para generar suficientes partes
            else:
                raise ValueError("El número de preguntas debe ser mayor que cero.")

            # Crear las partes dividiendo el texto en fragmentos más pequeños
            parts = [text[i:i + part_size] for i in range(0, total_length, part_size)]

            # Selección aleatoria si hay más partes que preguntas solicitadas
            if len(parts) > num_questions:
                selected_parts = random.sample(parts, k=num_questions)  # Selección aleatoria
            else:
                selected_parts = parts  # Si hay partes justas, usarlas directamente

        except Exception as e:
            app.logger.error(f"Error procesando el PDF: {e}")
            return jsonify({"error": "No se pudo procesar el PDF"}), 500, headers

        app.logger.debug(f"{len(selected_parts)} preguntas seleccionadas después de dividir el texto dinámicamente")

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

@api_blueprint.route('/questionnaires/<id>/name', methods=['PUT'])
def update_questionnaire_name(id):
    try:
        data = request.get_json()
        new_name = data.get('name')

        if not new_name:
            return jsonify({"error": "El nombre es requerido"}), 400, headers

        result = Questionnaire.update_name(id, new_name)

        if result:
            return jsonify({"message": "Nombre actualizado correctamente"}), 200, headers
        else:
            return jsonify({"error": "Cuestionario no encontrado"}), 404, headers

    except Exception as e:
        app.logger.error(f"Error actualizando el nombre: {str(e)}")
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
        app.logger.debug(f"Comentario recibido: {data}")

        # Obtener datos del comentario
        question_id = data['id']
        questionnaire_id = data['qid']
        ratings = data['ratings']
        comment = data['comment']

        # Obtener información completa del cuestionario
        questionnaire = Questionnaire.get_questionnaire(questionnaire_id)
        if not questionnaire:
            return jsonify({"error": "Cuestionario no encontrado"}), 404, headers

        # Obtener información completa de la pregunta
        questions = Question.get_questions(questionnaire_id)
        question = next((q for q in questions if q['id'] == question_id), None)
        if not question:
            return jsonify({"error": "Pregunta no encontrada"}), 404, headers

        # Crear un comentario con toda la información contextual
        comment_data = Comment.create_comment(
            questionnaire_id=questionnaire_id,
            question_id=question_id,
            comment=comment,
            level_clarity=ratings['clarity'],
            level_complexity=ratings['complexity'],
            level_alignment=ratings['alignment'],
            level_quality=ratings['quality'],
            level_pedagogical=ratings['pedagogical'],
            level_cognitive=ratings['cognitive'],
            # Información del cuestionario
            questionnaire_name=questionnaire.get('name'),
            questionnaire_difficulty=questionnaire.get('difficulty'),
            questionnaire_date=questionnaire.get('date'),
            # Información de la pregunta
            question_text=question.get('question'),
            question_type=question.get('type'),
            question_difficulty=question.get('difficulty'),
            question_context=question.get('context'),
            question_answers=question.get('answers'),
            question_valid_answer=question.get('valid_answer'),
            question_evidence=question.get('evidence'),
            question_date=question.get('date')
        )

        return jsonify({"message": "¡Muchas Gracias! Tu comentario ha quedado registrado"}), 200, headers
    except Exception as e:
        app.logger.error(f"Error durante la creación del comentario: {str(e)}")
        app.logger.error(f"Detalles del error:\n {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500, headers

@api_blueprint.route('/export/moodle', methods=['POST'])
def export_moodle():
    data = request.json
    questionnaire_id = data.get('questionnaireId')
    questionnaire = Questionnaire.get_questionnaire(questionnaire_id)
    questions = Question.get_questions(questionnaire_id)

    quiz = ET.Element("quiz")

    comment_text = f' Cuestionario: {questionnaire.get("name")} - Dificultad: {questionnaire.get("difficulty")} '
    quiz.append(ET.Comment(comment_text))

    for idx, question in enumerate(questions, 1):
        answers = question.get("answers", [])
        is_essay = not answers or len(answers) == 0

        question_element = ET.SubElement(quiz, "question",
                                         type="essay" if is_essay else "multichoice")

        name = ET.SubElement(question_element, "name")
        ET.SubElement(name, "text").text = f"Pregunta {idx}"

        # Limpiar el texto de la pregunta de cualquier formato XML
        clean_question_text = question.get('question', '')
        clean_question_text = clean_question_text.replace('<![CDATA[', '').replace(']]>', '').strip()
        questiontext = ET.SubElement(question_element, "questiontext", format="html")
        ET.SubElement(questiontext, "text").text = f"<p>{clean_question_text}</p>"

        # Retroalimentación general en español
        generalfeedback = ET.SubElement(question_element, "generalfeedback", format="html")
        ET.SubElement(generalfeedback, "text").text = "<p>Revisa el material del curso si has tenido dificultades con esta pregunta.</p>"

        ET.SubElement(question_element, "defaultgrade").text = "1.0"
        ET.SubElement(question_element, "penalty").text = "0.3333333"
        ET.SubElement(question_element, "hidden").text = "0"

        if not is_essay:
            ET.SubElement(question_element, "single").text = "true"
            ET.SubElement(question_element, "shuffleanswers").text = "true"
            ET.SubElement(question_element, "answernumbering").text = "abc"

            valid_answer = question.get("valid_answer")

            for answer in answers:
                is_correct = answer == valid_answer
                fraction = "100" if is_correct else "0"

                answer_element = ET.SubElement(question_element, "answer",
                                               fraction=fraction,
                                               format="html")

                # Limpiar el texto de la respuesta
                clean_answer_text = answer.replace('<![CDATA[', '').replace(']]>', '').strip()
                ET.SubElement(answer_element, "text").text = f"<p>{clean_answer_text}</p>"

                feedback = ET.SubElement(answer_element, "feedback", format="html")
                if is_correct:
                    evidence_text = question.get("evidence", "").replace('<![CDATA[', '').replace(']]>', '').strip()
                    feedback_text = f"<p>{evidence_text}</p>"
                else:
                    feedback_text = "<p>Respuesta incorrecta. Revisa el material del curso.</p>"
                ET.SubElement(feedback, "text").text = feedback_text
        else:
            ET.SubElement(question_element, "responseformat").text = "editor"
            ET.SubElement(question_element, "responserequired").text = "1"
            ET.SubElement(question_element, "responsefieldlines").text = "10"
            ET.SubElement(question_element, "attachments").text = "0"
            ET.SubElement(question_element, "attachmentsrequired").text = "0"
            ET.SubElement(question_element, "graderinfo", format="html").text = "<p>Evaluar basándose en la precisión y completitud de la respuesta.</p>"
            ET.SubElement(question_element, "responsetemplate", format="html").text = ""

    xml_str = ET.tostring(quiz, encoding='utf8', method='xml', xml_declaration=False).decode('utf-8')

    xml_declaration = '<?xml version="1.0" encoding="UTF-8"?>\n'
    doctype = '<!DOCTYPE quiz SYSTEM "moodle_quiz.dtd">\n'
    complete_xml = xml_declaration + doctype + xml_str

    response = make_response(complete_xml)
    response.headers['Content-Type'] = 'application/xml'
    response.headers['Content-Disposition'] = f'attachment; filename="{questionnaire.get("name", "quiz")}.xml"'
    response.headers['Access-Control-Allow-Origin'] = '*'

    return response


@api_blueprint.route('/comments/<question_id>', methods=['GET'])
def get_comment(question_id):
    try:
        comment = Comment.get_comment(question_id)

        if comment:
            app.logger.info(f"Comentario encontrado para la pregunta {question_id}")
            return jsonify(comment), 200, headers
        else:
            app.logger.info(f"No se encontró comentario para la pregunta {question_id}")
            return jsonify({"message": "No comment found"}), 404, headers

    except Exception as e:
        app.logger.error(f"Error getting comment: {str(e)}")
        return jsonify({"error": str(e)}), 500, headers