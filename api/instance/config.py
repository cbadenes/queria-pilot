import os

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'

    # Configuración de MongoDB
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb://myuser:mypassword@localhost:27017/queria'

    # Configuración de LLM
    OLLAMA_URI = os.environ.get('OLLAMA_URI') or 'http://127.0.0.1:11434'
    OLLAMA_BASE_MODEL = os.environ.get('OLLAMA_BASE_MODEL') or 'llama3'

    # Configuración de RabbitMQ
    RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST') or '127.0.0.1'
    RABBITMQ_PORT = os.environ.get('RABBITMQ_PORT') or 5672
    RABBITMQ_USER = os.environ.get('RABBITMQ_USER') or 'admin'
    RABBITMQ_PASSWORD = os.environ.get('RABBITMQ_PASSWORD') or 'admin'
    RABBITMQ_QUEUE = os.environ.get('RABBITMQ_QUEUE') or 'queria-queue'

    # Configuraciones de Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL') or 'DEBUG'
    LOG_MAX_BYTES = os.environ.get('LOG_MAX_BYTES') or 10000000  # 10MB
    LOG_BACKUP_COUNT = os.environ.get('LOG_BACKUP_COUNT') or 100
