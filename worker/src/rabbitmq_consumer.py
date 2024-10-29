import pika
import logging
import threading
from .models import Question
import json
from datetime import datetime

logger = logging.getLogger('queriaWorker')

def start_consumer(config):
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=config['RABBITMQ_HOST'],
            credentials=pika.PlainCredentials(
                config['RABBITMQ_USER'],
                config['RABBITMQ_PASSWORD']
            )
        )
    )
    channel = connection.channel()
    channel.queue_declare(queue=config['RABBITMQ_QUEUE'], durable=True)

    def callback(ch, method, properties, body):
        logger.debug(f"Received {body}")
        data = json.loads(body)
        try:
            question_txt = "sample"
            type = "multi"
            answers = []
            valid_answer = "valid response"
            question = Question.create_question(data['id'], question_txt, data['difficulty'], type, data['context'], answers, valid_answer)
            logger.info(f"Question created with ID {question['id']}")
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            logger.error(f"Failed to create question: {e}")
            # Rechazar el mensaje sin reencolar
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_qos(prefetch_count=1)  # Asegura que el consumidor sólo reciba un mensaje a la vez
    channel.basic_consume(queue=config['RABBITMQ_QUEUE'], on_message_callback=callback, auto_ack=False)

    logger.info('Starting Consuming')
    channel.start_consuming()
