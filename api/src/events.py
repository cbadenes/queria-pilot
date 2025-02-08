import json
import pika
import threading
import time
from pika.exceptions import AMQPConnectionError, ChannelClosedByBroker, StreamLostError
from flask import current_app as app

class RabbitMQ:
    def __init__(self):
        self.connection = None
        self.channel = None
        self._lock = threading.Lock()
        self.should_reconnect = True
        self._health_check_thread = None

    def connect(self):
        try:
            credentials = pika.PlainCredentials(app.config['RABBITMQ_USER'], app.config['RABBITMQ_PASSWORD'])
            parameters = pika.ConnectionParameters(
                host=app.config['RABBITMQ_HOST'],
                port=app.config['RABBITMQ_PORT'],
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300,  # 5 minutos de timeout
                connection_attempts=3,
                retry_delay=5
            )
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            self.channel.queue_declare(queue=app.config['RABBITMQ_QUEUE'], durable=True)
            app.logger.info("Conexión con RabbitMQ establecida.")

            # Iniciar el health check si no está corriendo
            self._start_health_check()

        except AMQPConnectionError as e:
            app.logger.error(f"Error al conectar a RabbitMQ: {e}")
            raise e

    def _start_health_check(self):
        if self._health_check_thread is None or not self._health_check_thread.is_alive():
            self._health_check_thread = threading.Thread(target=self._health_check, daemon=True)
            self._health_check_thread.start()
            app.logger.info("Health check thread iniciado.")

    def _health_check(self):
        while self.should_reconnect:
            time.sleep(30)  # Verificar cada 30 segundos
            try:
                with self._lock:
                    if self.connection and not self.connection.is_open:
                        app.logger.warning("Conexión perdida, intentando reconectar...")
                        self.close()
                        self.connect()
                    elif self.channel and not self.channel.is_open:
                        app.logger.warning("Canal cerrado, intentando reabrir...")
                        self.channel = self.connection.channel()
                        self.channel.queue_declare(queue=app.config['RABBITMQ_QUEUE'], durable=True)
            except Exception as e:
                app.logger.error(f"Error en health check: {e}")
                try:
                    self.close()
                except:
                    pass
                try:
                    self.connect()
                except:
                    pass

    def close(self):
        self.should_reconnect = False
        if self._health_check_thread and self._health_check_thread.is_alive():
            self._health_check_thread.join(timeout=1)

        if self.connection:
            try:
                self.connection.close()
                app.logger.info("Conexión con RabbitMQ cerrada.")
            except Exception as e:
                app.logger.error(f"Error al cerrar la conexión: {e}")
            finally:
                self.connection = None
                self.channel = None

    def send_message(self, message):
        max_retries = 3
        retry_count = 0

        while retry_count < max_retries:
            try:
                with self._lock:
                    if not self.channel or self.channel.is_closed:
                        app.logger.warning("Canal no disponible, intentando reconectar...")
                        self.connect()

                    self.channel.basic_publish(
                        exchange='',
                        routing_key=app.config['RABBITMQ_QUEUE'],
                        body=json.dumps(message),
                        properties=pika.BasicProperties(
                            delivery_mode=2,  # Hacer mensajes persistentes
                            expiration='86400000'  # TTL de 24 horas en milisegundos
                        )
                    )
                    app.logger.debug(f"Mensaje enviado a la cola '{app.config['RABBITMQ_QUEUE']}'")
                    return True

            except (ChannelClosedByBroker, StreamLostError, AMQPConnectionError) as e:
                retry_count += 1
                app.logger.error(f"Error al enviar mensaje (intento {retry_count}): {e}")
                if retry_count < max_retries:
                    time.sleep(2)  # Esperar antes de reintentar
                try:
                    self.close()
                except:
                    pass

        raise Exception("Error al enviar mensaje después de múltiples intentos")

rabbitmq = RabbitMQ()

# La clase Ticket se mantiene igual
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