from flask import Flask
from flask_cors import CORS
from api.routes import api_blueprint
from api.models import mongo_db
from api.events import rabbitmq
from flask_jwt_extended import JWTManager
import logging
from logging.handlers import RotatingFileHandler


def create_app():
    app = Flask(__name__)
    app.config.from_object('instance.config.Config')
    app.config['JWT_SECRET_KEY'] = 'super-secret'  # Cambia esto por una clave real en producción

    file_handler = RotatingFileHandler(
        app.config['LOG_FILE'],
        maxBytes=app.config['LOG_MAX_BYTES'],
        backupCount=app.config['LOG_BACKUP_COUNT']
    )

    file_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(file_formatter)

    console_handler = logging.StreamHandler()
    console_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(console_formatter)


    app.logger = logging.getLogger('MyAPI')
    app.logger.setLevel(getattr(logging, app.config['LOG_LEVEL']))
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.propagate = False  # Importante para no propagar logs al logger por defecto de Flask


    # Imprime el nivel actual de log
    print(f"Logger level is set to: {app.logger.getEffectiveLevel()}")
    print(f"Logger level name is: {logging.getLevelName(app.logger.getEffectiveLevel())}")

    from api.routes import init_routes
    init_routes(app)

    # Aplica CORS a todas las rutas
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    JWTManager(app)

    with app.app_context():
        mongo_db.init_app()
        rabbitmq.connect()

    app.register_blueprint(api_blueprint, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run()
