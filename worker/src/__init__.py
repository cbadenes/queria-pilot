from flask import Flask
from .routes import api_blueprint
from .rabbitmq_consumer import start_consumer

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    app.register_blueprint(api_blueprint, url_prefix='/api')

    # Iniciar el consumidor de RabbitMQ en un hilo separado
    start_consumer(app.config)

    return app
