from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.utils import secure_filename
import os
from .utils import extract_questions
from .models import User
import bcrypt

api_blueprint = Blueprint('api', __name__)

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

# Ruta para generar el cuestionario
@api_blueprint.route('/createQuestionnaire', methods=['POST'])
def create_questionnaire():
    # Obtener el archivo PDF
    if 'pdf' not in request.files:
        return jsonify({"error": "No PDF file provided"}), 400

    pdf_file = request.files['pdf']
    if pdf_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Guardar el archivo PDF en una ubicación temporal
    filename = secure_filename(pdf_file.filename)
    pdf_path = os.path.join('/tmp', filename)
    pdf_file.save(pdf_path)

    # Extraer los datos enviados en la solicitud
    num_questions = request.form.get('numQuestions', type=int)
    difficulty = request.form.get('difficulty')
    percentage_free_response = request.form.get('percentageFreeResponse', type=int)

    # Procesar el archivo PDF y extraer preguntas (función que debes tener en utils.py)
    try:
        questions = extract_questions(pdf_path)

        # Aquí podrías hacer alguna lógica adicional para generar el cuestionario
        # basándote en el número de preguntas, dificultad, etc.

        # Eliminar el archivo temporal después de su uso
        os.remove(pdf_path)

        # Devolver una respuesta exitosa
        return jsonify({"message": "Questionnaire generation requested successfully", "questions": questions}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api_blueprint.route('/cuestionarios', methods=['GET'])
def get_cuestionarios():
    # Datos de ejemplo
    cuestionarios = [
        {"nombre": "Cuestionario 1", "estado": "en_construccion"},
        {"nombre": "Cuestionario 2", "estado": "preparado"},
        {"nombre": "Cuestionario 3", "estado": "en_construccion"}
    ]
    return jsonify(cuestionarios=cuestionarios)