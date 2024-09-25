from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash
from .models import User
import bcrypt

api_blueprint = Blueprint('api', __name__)

@api_blueprint.route('/login', methods=['POST'])
def login():
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

@api_blueprint.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    pdf_file = request.files['file']
    # Asumiendo que `extract_questions` es una función que procesa el PDF y extrae preguntas
    questions = extract_questions(pdf_file)
    return jsonify(questions)
