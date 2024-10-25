from flask import Flask
from flask_cors import CORS
from api.routes import api_blueprint
from api.models import mongo_db
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    app.config.from_object('instance.config.Config')
    app.config['JWT_SECRET_KEY'] = 'super-secret'  # Cambia esto por una clave real en producción

    # Aplica CORS a todas las rutas
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
    JWTManager(app)  # Inicializa JWT

    with app.app_context():
        mongo_db.init_app()  # Inicializa MongoDB dentro del contexto de la aplicación

    app.register_blueprint(api_blueprint, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
