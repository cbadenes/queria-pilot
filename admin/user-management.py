from pymongo import MongoClient
from dotenv import load_dotenv
import bcrypt
import secrets
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os
import argparse
from typing import Dict, Optional

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class UserManager:
    def __init__(self, mongo_uri: str, smtp_config: Dict):
        """
        Inicializa el gestor de usuarios

        :param mongo_uri: URI de conexión a MongoDB
        :param smtp_config: Diccionario con la configuración SMTP
        """
        self.mongo_uri = mongo_uri
        self.smtp_config = smtp_config
        self.client = None
        self.db = None

    def connect_to_mongodb(self):
        """Establece conexión con MongoDB"""
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client.get_database()
            logger.info("Conexión exitosa a MongoDB")
        except Exception as e:
            logger.error(f"Error al conectar a MongoDB: {e}")
            raise

    def generate_password(self, length: int = 12) -> str:
        """
        Genera una contraseña segura

        :param length: Longitud de la contraseña
        :return: Contraseña generada
        """
        alphabet = string.ascii_letters + string.digits + string.punctuation
        while True:
            password = ''.join(secrets.choice(alphabet) for i in range(length))
            if (any(c.islower() for c in password)
                    and any(c.isupper() for c in password)
                    and any(c.isdigit() for c in password)
                    and any(c in string.punctuation for c in password)):
                return password

    def send_email(self, to_email: str, password: str):
        """
        Envía email con la contraseña

        :param to_email: Dirección de correo del destinatario
        :param password: Contraseña generada
        """
        try:
            msg = MIMEMultipart()
            msg['From'] = self.smtp_config['user']
            msg['To'] = to_email
            msg['Subject'] = "Tu nueva contraseña de acceso"

            body = f"""
            Hola,

            Tu contraseña de acceso al servicio de Queria es: {password}

            Puedes acceder al servicio en: http://queria.etsisi.upm.es

            Saludos,
            El equipo de Queria
            """

            msg.attach(MIMEText(body, 'plain'))

            with smtplib.SMTP(self.smtp_config['server'], self.smtp_config['port']) as server:
                server.starttls()
                server.login(self.smtp_config['user'], self.smtp_config['password'])
                server.send_message(msg)

            logger.info(f"Email enviado exitosamente a {to_email}")
        except Exception as e:
            logger.error(f"Error al enviar email a {to_email}: {e}")
            raise

    def process_user(self, email: str, name: str, action: str = "new") -> Optional[str]:
        """
        Procesa un usuario: lo crea o resetea su contraseña

        :param email: Email del usuario
        :param name: Nombre del usuario
        :param action: "new" para nuevo usuario, "reset" para resetear contraseña
        :return: Contraseña generada si el proceso fue exitoso, None en caso contrario
        """
        try:
            users_collection = self.db.users
            existing_user = users_collection.find_one({"email": email})

            if action == "remove":
                if not existing_user:
                    logger.warning(f"Usuario no encontrado para eliminar: {email}")
                    return None

                # Eliminamos los cuestionarios y preguntas asociadas
                questionnaires = self.db.questionnaires.find({"email": email})
                for questionnaire in questionnaires:
                    qid = questionnaire['_id']
                    self.db.questions.delete_many({"qid": qid})

                self.db.questionnaires.delete_many({"email": email})
                # Eliminamos el usuario
                users_collection.delete_one({"email": email})
                logger.info(f"Usuario eliminado: {email}")
                return "removed"

            if action == "new" and existing_user:
                logger.warning(f"Usuario ya existe: {email}")
                return None

            if action in ["new", "reset"]:
                password = self.generate_password()
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

                if action == "new":
                    users_collection.insert_one({
                        "email": email,
                        "password": hashed_password,
                        "name": name
                    })
                    logger.info(f"Usuario creado: {email}")
                else:  # reset
                    if not existing_user:
                        logger.warning(f"Usuario no encontrado para reset: {email}")
                        return None
                    users_collection.update_one(
                        {"email": email},
                        {"$set": {"password": hashed_password}}
                    )
                    logger.info(f"Contraseña reseteada para: {email}")

                self.send_email(email, password)
                return password

        except Exception as e:
            logger.error(f"Error al procesar usuario {email}: {e}")
            return None

def process_users_file(user_manager: UserManager, users_file: str):
    """
    Procesa el archivo de usuarios

    :param user_manager: Instancia de UserManager
    :param users_file: Ruta al archivo de usuarios
    """
    try:
        with open(users_file, 'r') as f:
            for line in f:
                # Formato esperado: email,nombre,acción
                # Ejemplo: juan@example.com,Juan Pérez,new
                email, name, action = line.strip().split(',')
                if action not in ['new', 'reset', 'remove']:
                    logger.warning(f"Acción no válida para {email}: {action}")
                    continue

                result = user_manager.process_user(email, name, action)
                if result:
                    logger.info(f"Usuario procesado exitosamente: {email}")
                else:
                    logger.warning(f"No se pudo procesar usuario: {email}")

    except FileNotFoundError:
        logger.error(f"No se encontró el archivo: {users_file}")
        raise
    except Exception as e:
        logger.error(f"Error al procesar el archivo de usuarios: {e}")
        raise

def main():
    # Cargar variables de entorno
    load_dotenv()
    # Configurar el parser de argumentos
    parser = argparse.ArgumentParser(description='Procesa usuarios desde un archivo CSV')
    parser.add_argument('users_file', help='Ruta al archivo CSV con los usuarios')
    parser.add_argument('--mongo-uri', default=os.getenv('MONGO_URI')
                        help='URI de conexión a MongoDB')
    parser.add_argument('--smtp-server', default='smtp.gmail.com',
                        help='Servidor SMTP')
    parser.add_argument('--smtp-port', type=int, default=587,
                        help='Puerto SMTP')
    parser.add_argument('--smtp-user', default=os.getenv('SMTP_USER'),
                        help='Usuario SMTP')
    parser.add_argument('--smtp-password', default=os.getenv('SMTP_PASSWORD'),
                        help='Contraseña SMTP')

    args = parser.parse_args()

    # Configuración SMTP
    smtp_config = {
        'server': args.smtp_server,
        'port': args.smtp_port,
        'user': args.smtp_user,
        'password': args.smtp_password
    }

    # Inicializar gestor de usuarios
    user_manager = UserManager(args.mongo_uri, smtp_config)
    user_manager.connect_to_mongodb()

    try:
        # Procesar archivo de usuarios
        process_users_file(user_manager, args.users_file)
    finally:
        if user_manager.client:
            user_manager.client.close()

if __name__ == "__main__":
    main()