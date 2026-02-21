from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import random
import string
import hashlib
import datetime
import time
import uuid
import os
import json
import bcrypt
from werkzeug.utils import secure_filename
import threading


app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas las rutas

# Simulación de base de datos en memoria
db = {
    'users': {},
    'questionnaires': {},
    'questions': {},
    'comments': {}
}

# Configuración
UPLOAD_FOLDER = 'temp'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20MB


def generate_id():
    """Genera un ID único tipo hash MD5"""
    return hashlib.md5(str(uuid.uuid4()).encode()).hexdigest()


def create_sample_data():
    """Crea datos de muestra para la API falsa"""

    # Crear usuarios de muestra
    for email in ['profesor@universidad.es', 'alumno@universidad.es', 'admin@universidad.es']:
        password = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt())
        name = email.split('@')[0].capitalize()
        db['users'][email] = {
            'email': email,
            'password': password,
            'name': f"{name} {random.choice(['García', 'López', 'Martínez', 'Rodríguez'])}"
        }

    # Crear cuestionarios de muestra
    difficulties = ["Fácil", "Medio", "Difícil"]
    subjects = ["Matemáticas", "Programación", "Inteligencia Artificial", "Bases de Datos", "Redes"]

    for i in range(5):
        qid = generate_id()
        email = random.choice(list(db['users'].keys()))
        db['questionnaires'][qid] = {
            'id': qid,
            'name': f"{random.choice(subjects)} - Tema {random.randint(1, 10)}",
            'filename': f"documento_{i+1}.pdf",
            'date': datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 30)),
            'status': random.choice(['scheduled', 'in_progress', 'completed']),
            'email': email,
            'difficulty': random.choice(difficulties),
            'num_questions': random.randint(5, 20),
            'ratio': random.randint(0, 100)
        }

        # Crear preguntas para cada cuestionario
        num_questions = db['questionnaires'][qid]['num_questions']
        for j in range(num_questions):
            question_id = generate_id()

            # Determinar si es pregunta abierta o de opciones múltiples
            is_open = random.random() < (db['questionnaires'][qid]['ratio'] / 100)

            if is_open:
                question_type = "open"
                answers = []
                valid_answer = None
            else:
                question_type = "multi"
                # Generar respuestas de opción múltiple
                answers = [
                    f"Opción {k+1}: {' '.join(random.sample(string.ascii_lowercase, 5))}"
                    for k in range(4)
                ]
                valid_answer = random.choice(answers)

            db['questions'][question_id] = {
                'id': question_id,
                'qid': qid,
                'question': f"¿Pregunta de ejemplo número {j+1} para el cuestionario {i+1}?",
                'date': datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 15)),
                'difficulty': db['questionnaires'][qid]['difficulty'],
                'type': question_type,
                'context': f"Contexto para la pregunta {j+1}. Este texto simula el contenido extraído del PDF del que se generó la pregunta.",
                'answers': answers,
                'valid_answer': valid_answer,
                'evidence': "Esta es la evidencia que justifica la respuesta correcta basada en el contenido del documento.",
                'responses': []
            }

    # Crear comentarios de muestra
    for question_id in list(db['questions'].keys())[:3]:  # Solo para algunas preguntas
        comment_id = generate_id()
        question = db['questions'][question_id]
        qid = question['qid']

        db['comments'][comment_id] = {
            'id': comment_id,
            'comment': f"Comentario de prueba sobre la pregunta {question_id[:6]}...",
            'date': datetime.datetime.now() - datetime.timedelta(days=random.randint(0, 5)),
            'ratings': {
                'clarity': random.randint(1, 5),
                'complexity': random.randint(1, 5),
                'alignment': random.randint(1, 5),
                'quality': random.randint(1, 5),
                'pedagogical': random.randint(1, 5),
                'cognitive': random.randint(1, 5)
            },
            'questionnaire_id': qid,
            'question_id': question_id,
            'questionnaire': {
                'name': db['questionnaires'][qid]['name'],
                'difficulty': db['questionnaires'][qid]['difficulty'],
                'date': db['questionnaires'][qid]['date']
            },
            'question': {
                'text': question['question'],
                'type': question['type'],
                'difficulty': question['difficulty'],
                'context': question['context'],
                'answers': question['answers'],
                'valid_answer': question['valid_answer'],
                'evidence': question['evidence'],
                'date': question['date']
            }
        }


def serialize_datetime(obj):
    """Convierte objetos datetime a string para serialización JSON"""
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


@app.route('/api/login', methods=['POST'])
def login():
    """Simula el proceso de login"""
    user_data = request.get_json()
    email = user_data.get('email')
    password = user_data.get('password')

    if email in db['users']:
        user = db['users'][email]
        # Verificar contraseña (simplificado para la versión fake)
        if bcrypt.checkpw(password.encode('utf-8'), user['password']):
            # Simular un token JWT
            access_token = hashlib.sha256(f"{email}{time.time()}".encode()).hexdigest()
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({"message": "Contraseña incorrecta"}), 401
    else:
        return jsonify({"message": "Usuario Desconocido"}), 401


@app.route('/api/questionnaires', methods=['GET'])
def get_questionnaires():
    """Obtiene todos los cuestionarios para un email específico"""
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400

    questionnaires = [q for q in db['questionnaires'].values() if q['email'] == email]
    return jsonify(questionnaires), 200


@app.route('/api/questionnaires/<id>/questions', methods=['GET'])
def get_questions(id):
    """Obtiene todas las preguntas para un cuestionario específico"""
    questions = [q for q in db['questions'].values() if q['qid'] == id]

    if questions:
        return jsonify(questions), 200
    else:
        return jsonify({"error": "Cuestionario Inválido"}), 404


@app.route('/api/questionnaires/<id>', methods=['DELETE'])
def delete_questionnaire(id):
    """Elimina un cuestionario y sus preguntas asociadas"""
    if id in db['questionnaires']:
        # Eliminar preguntas asociadas
        deleted_questions = 0
        questions_to_delete = []

        for q_id, question in db['questions'].items():
            if question['qid'] == id:
                questions_to_delete.append(q_id)
                deleted_questions += 1

        for q_id in questions_to_delete:
            del db['questions'][q_id]

        # Eliminar cuestionario
        del db['questionnaires'][id]

        return jsonify({
            "deleted_questions": deleted_questions,
            "questionnaire_deleted": True
        }), 200
    else:
        return jsonify({"error": "Cuestionario Inválido"}), 404


def simulate_question_generation(qid, num_questions, difficulty, percentage_free_response):
    """Simula la generación asíncrona de preguntas (como lo haría el worker)"""
    time.sleep(2)  # Simular un pequeño retraso

    for i in range(num_questions):
        question_id = generate_id()
        is_open = random.random() < (percentage_free_response / 100)

        if is_open:
            question_type = "open"
            answers = []
            valid_answer = None
        else:
            question_type = "multi"
            answers = [
                f"Esta es la respuesta de opción {k+1}"
                for k in range(4)
            ]
            valid_answer = random.choice(answers)

        db['questions'][question_id] = {
            'id': question_id,
            'qid': qid,
            'question': f"¿Esta es una pregunta de ejemplo generada para el cuestionario con dificultad {difficulty}?",
            'date': datetime.datetime.now(),
            'difficulty': difficulty,
            'type': question_type,
            'context': f"Este es un fragmento de texto de ejemplo que sirve como contexto para la pregunta.",
            'answers': answers,
            'valid_answer': valid_answer,
            'evidence': "Esta es la evidencia que justifica por qué la respuesta es correcta.",
            'responses': []
        }

    # Actualizar estado del cuestionario después de generar las preguntas
    if qid in db['questionnaires']:
        db['questionnaires'][qid]['status'] = 'in_progress'


@app.route('/api/questionnaires', methods=['POST'])
def create_questionnaire():
    """Crea un nuevo cuestionario a partir de un archivo PDF"""
    if 'pdf' not in request.files:
        return jsonify({"error": "No se ha adjuntado ningún PDF"}), 400

    pdf_file = request.files['pdf']
    if not pdf_file.filename:
        return jsonify({"error": "Nombre de archivo inválido"}), 400

    if not pdf_file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "El archivo debe ser un PDF"}), 400

    # Extraer parámetros del formulario
    num_questions = int(request.form.get('numQuestions', 0))
    difficulty = request.form.get('difficulty', 'Medio')
    percentage_free_response = int(request.form.get('percentageFreeResponse', 0))
    questionnaire_name = request.form.get('name', '')
    user_email = request.form.get('email', '')

    # Validar parámetros
    if not all([num_questions, difficulty, questionnaire_name, user_email]):
        return jsonify({"error": "Faltan datos obligatorios del cuestionario"}), 400

    if not (0 <= percentage_free_response <= 100):
        return jsonify({"error": "El porcentaje de preguntas libres debe estar entre 0 y 100"}), 400

    # Guardar archivo temporalmente (simulado)
    filename = secure_filename(pdf_file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    pdf_file.save(filepath)

    # Crear el cuestionario
    qid = generate_id()

    questionnaire = {
        'id': qid,
        '_id': qid,  # Para mantener compatibilidad
        'name': questionnaire_name,
        'filename': filename,
        'date': datetime.datetime.now(),
        'status': 'scheduled',
        'email': user_email,
        'difficulty': difficulty,
        'num_questions': num_questions,
        'ratio': percentage_free_response
    }

    db['questionnaires'][qid] = questionnaire

    # Simular la generación asíncrona de preguntas
    thread = threading.Thread(
        target=simulate_question_generation,
        args=(qid, num_questions, difficulty, percentage_free_response)
    )
    thread.daemon = True
    thread.start()

    return jsonify(questionnaire), 200


@app.route('/api/questionnaires/<id>/name', methods=['PUT'])
def update_questionnaire_name(id):
    """Actualiza el nombre de un cuestionario"""
    data = request.get_json()
    new_name = data.get('name')

    if not new_name:
        return jsonify({"error": "El nombre es requerido"}), 400

    if id in db['questionnaires']:
        db['questionnaires'][id]['name'] = new_name
        return jsonify({"message": "Nombre actualizado correctamente"}), 200
    else:
        return jsonify({"error": "Cuestionario no encontrado"}), 404


@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    """Simula la evaluación de una respuesta a una pregunta"""
    data = request.json
    question_id = data.get('questionId')
    question_text = data.get('question')
    difficulty = data.get('difficulty')
    user_response = data.get('response')
    context = data.get('context')

    # Simular un pequeño retraso como lo haría el modelo de IA
    time.sleep(1)

    # Generar una evaluación aleatoria
    score = random.randint(0, 100)

    if score > 80:
        explanation = "Excelente respuesta. Has demostrado una comprensión completa del tema."
    elif score > 60:
        explanation = "Buena respuesta, aunque podría mejorarse en algunos aspectos específicos."
    elif score > 40:
        explanation = "Respuesta aceptable, pero falta profundidad en varios conceptos importantes."
    else:
        explanation = "La respuesta no aborda correctamente los puntos clave del tema."

    return jsonify({
        "score": score,
        "explanation": explanation,
        "message": "Evaluación completada."
    }), 200


@app.route('/api/comments', methods=['POST'])
def handle_comments():
    """Maneja la creación de comentarios para preguntas"""
    data = request.get_json()

    question_id = data.get('id')
    questionnaire_id = data.get('qid')
    ratings = data.get('ratings')
    comment_text = data.get('comment')

    # Verificar que exista la pregunta y el cuestionario
    if question_id not in db['questions'] or questionnaire_id not in db['questionnaires']:
        return jsonify({"error": "Pregunta o cuestionario no encontrado"}), 404

    # Crear un nuevo comentario
    comment_id = generate_id()
    questionnaire = db['questionnaires'][questionnaire_id]
    question = db['questions'][question_id]

    db['comments'][comment_id] = {
        'id': comment_id,
        'comment': comment_text,
        'date': datetime.datetime.now(),
        'ratings': ratings,
        'questionnaire_id': questionnaire_id,
        'question_id': question_id,
        'questionnaire': {
            'name': questionnaire['name'],
            'difficulty': questionnaire['difficulty'],
            'date': questionnaire['date']
        },
        'question': {
            'text': question['question'],
            'type': question['type'],
            'difficulty': question['difficulty'],
            'context': question['context'],
            'answers': question['answers'],
            'valid_answer': question['valid_answer'],
            'evidence': question['evidence'],
            'date': question['date']
        }
    }

    return jsonify({"message": "¡Muchas Gracias! Tu comentario ha quedado registrado"}), 200


@app.route('/api/comments/<question_id>', methods=['GET'])
def get_comment(question_id):
    """Obtiene el comentario para una pregunta específica"""
    # Buscar el comentario más reciente para la pregunta
    matching_comments = [c for c in db['comments'].values() if c['question_id'] == question_id]

    if matching_comments:
        # Ordenar por fecha (más reciente primero)
        comment = sorted(matching_comments, key=lambda x: x['date'], reverse=True)[0]
        return jsonify(comment), 200
    else:
        return jsonify({"message": "No comment found"}), 404


@app.route('/api/export/moodle', methods=['POST'])
def export_moodle():
    """Simula la exportación de un cuestionario en formato XML de Moodle"""
    data = request.json
    questionnaire_id = data.get('questionnaireId')

    if questionnaire_id not in db['questionnaires']:
        return jsonify({"error": "Cuestionario no encontrado"}), 404

    questionnaire = db['questionnaires'][questionnaire_id]
    questions = [q for q in db['questions'].values() if q['qid'] == questionnaire_id]

    # Generar un XML de ejemplo
    xml_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE quiz SYSTEM "moodle_quiz.dtd">
<quiz>
  <!-- Cuestionario: {questionnaire['name']} - Dificultad: {questionnaire['difficulty']} -->
'''

    for idx, question in enumerate(questions, 1):
        is_essay = question['type'] == 'open'

        xml_content += f'''  <question type="{("essay" if is_essay else "multichoice")}">
    <name>
      <text>Pregunta {idx}</text>
    </name>
    <questiontext format="html">
      <text><p>{question['question']}</p></text>
    </questiontext>
    <generalfeedback format="html">
      <text><p>Revisa el material del curso si has tenido dificultades con esta pregunta.</p></text>
    </generalfeedback>
    <defaultgrade>1.0</defaultgrade>
    <penalty>0.3333333</penalty>
    <hidden>0</hidden>
'''

        if not is_essay:
            xml_content += '    <single>true</single>\n'
            xml_content += '    <shuffleanswers>true</shuffleanswers>\n'
            xml_content += '    <answernumbering>abc</answernumbering>\n'

            for answer in question['answers']:
                is_correct = answer == question['valid_answer']
                xml_content += f'''    <answer fraction="{("100" if is_correct else "0")}" format="html">
      <text><p>{answer}</p></text>
      <feedback format="html">
        <text><p>{("Esta es la respuesta correcta: " + question['evidence'] if is_correct else "Respuesta incorrecta. Revisa el material del curso.")}</p></text>
      </feedback>
    </answer>
'''
        else:
            xml_content += '''    <responseformat>editor</responseformat>
    <responserequired>1</responserequired>
    <responsefieldlines>10</responsefieldlines>
    <attachments>0</attachments>
    <attachmentsrequired>0</attachmentsrequired>
    <graderinfo format="html"><p>Evaluar basándose en la precisión y completitud de la respuesta.</p></graderinfo>
    <responsetemplate format="html"></responsetemplate>
'''

        xml_content += '  </question>\n'

    xml_content += '</quiz>'

    response = make_response(xml_content)
    response.headers['Content-Type'] = 'application/xml'
    response.headers['Content-Disposition'] = f'attachment; filename="{questionnaire["name"]}.xml"'

    return response


if __name__ == '__main__':
    # Crear datos de muestra
    create_sample_data()

    # Imprimir mensaje informativo
    print("=" * 80)
    print("QuerIA API para desarrollo iniciada")
    print("Usuarios disponibles:")
    for email in db['users'].keys():
        print(f"  - Email: {email}, Password: password123")
    print("=" * 80)

    app.run(host='0.0.0.0', port=3500, debug=True)