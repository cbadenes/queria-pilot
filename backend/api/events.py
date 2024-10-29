import json
from pika import BlockingConnection, ConnectionParameters, PlainCredentials
from flask import current_app as app
from pika.exceptions import AMQPConnectionError


class RabbitMQ:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.queue_name = 'queria_queue'  # Nombre de la cola que usarás en ActiveMQ

    def connect(self):
        try:
            credentials = PlainCredentials(app.config['RABBITMQ_USER'], app.config['RABBITMQ_PASSWORD'])
            parameters = ConnectionParameters(
                host=app.config['RABBITMQ_HOST'],
                port=app.config['RABBITMQ_PORT'],
                credentials=credentials
            )
            self.connection = BlockingConnection(parameters)
            self.channel = self.connection.channel()
            self.channel.queue_declare(queue=self.queue_name)
            app.logger.info("Conexión con RabbitMQ establecida.")
        except AMQPConnectionError as e:
            app.logger.error(f"Error al conectar a RabbitMQ: {e}")

    def close(self):
        if self.connection:
            self.connection.close()
            app.logger.info("Conexión con RabbitMQ cerrada.")
            self.connection = None
            self.channel = None

    def send_message(self, message):
        if not self.channel:
            self.connect()  # Reconectar si la conexión no está activa
        try:
            self.channel.basic_publish(
                exchange='',
                routing_key=self.queue_name,
                body=json.dumps(message)
            )
            app.logger.debug(f"Mensaje enviado a la cola '{self.queue_name}': {message}")
        except Exception as e:
            app.logger.error(f"Error al enviar mensaje a RabbitMQ: {e}")
            self.close()  # Cerrar la conexión si hay un error


rabbitmq = RabbitMQ()


class Ticket:

    @staticmethod
    def create_question_event(context, difficulty, percentage_free_response, id, email):
        event = {
            "event_type": "CreateQuestion",
            "context": context,
            "difficulty": difficulty,
            "percentage_free_response": percentage_free_response,
            "id": id,
            "email": email
        }
        rabbitmq.send_message(event)