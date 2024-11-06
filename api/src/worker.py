import pika
import logging
import threading
from .models import Question, Questionnaire
import json
from datetime import datetime
import random
import string
import time
from .chats import Conversation

logger = logging.getLogger('queriaWorker')
def generate_random_text(length):
    letters = string.ascii_letters + string.digits + string.punctuation + ' '
    return ''.join(random.choice(letters) for _ in range(length))

def random_delay(min_seconds, max_seconds):
    delay = random.uniform(min_seconds, max_seconds)
    print(f"Delaying for {delay:.2f} seconds")
    time.sleep(delay)


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
            #random_delay(0.5, 2.5)
            logger.info(f"generating question by llm...")
            ratio = data['percentage_free_response']
            open_question = random.uniform(0, 100) < ratio

            if (open_question):
                quiz = Conversation.ask_open_question(data['context'],data['difficulty'])
                type = "open"
                answers = []
            else:
                quiz = Conversation.ask_multi_question(data['context'],data['difficulty'])
                type = "multi"
                answers = [value for key, value in quiz.items() if key.startswith("OPCION")]
                random.shuffle(answers)

            valid_answer = quiz['RESPUESTA']
            evidence = quiz['EVIDENCIA']
            question = Question.create_question(data['id'], quiz['PREGUNTA'], data['difficulty'], type, data['context'], answers, valid_answer, evidence)
            logger.info(f"Question created with ID {question['id']}")
            ch.basic_ack(delivery_tag=method.delivery_tag)

            # Comprobar si se han creado todas las preguntas de un cuestionario
            questions = Question.get_questions(data['id'])
            logger.info(f"Questions: {questions}")

            questionnaires = Questionnaire.get_questionnaire(data['email'],data['id'])
            if (len(questionnaires)>0):
                questionnaire = questionnaires[0]
                logger.info(f"Questionnaire: {questionnaire}")
                logger.info(f"Num Questions in DB: {len(questions)}")
                logger.info(f"Num Questions in Questionnaire: {questionnaire}")
                if (len(questions) == questionnaire['num_questions']):
                    logger.info("Updating questionnaire ..")
                    Questionnaire.update_status(data['id'], "in_progress")
                    logger.info("questionnaire updated")


        except Exception as e:
            logger.error(f"Failed to create question: {e}")
            # Rechazar el mensaje sin reencolar
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    channel.basic_qos(prefetch_count=1)  # Asegura que el consumidor sólo reciba un mensaje a la vez
    channel.basic_consume(queue=config['RABBITMQ_QUEUE'], on_message_callback=callback, auto_ack=False)

    logger.info('Starting Consuming')
    channel.start_consuming()
