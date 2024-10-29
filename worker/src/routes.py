from flask import Blueprint, jsonify, request
from flask import current_app as app
import uuid

api_blueprint = Blueprint('api', __name__)


def init_routes(app):
    @app.before_request
    def before_request_logging():
        # Genera un identificador único para la solicitud y guárdalo en el contexto de la solicitud
        g.request_id = str(uuid.uuid4())
        app.logger.info('[%s] Received request: %s %s', g.request_id, request.method, request.url)
        #app.logger.debug('[%s] Body: %s', g.request_id, request.get_data(as_text=True))


    @app.after_request
    def after_request_logging(response):
        app.logger.info('[%s] Response status: %s', g.request_id, response.status)
        app.logger.debug('[%s] Response data: %s', g.request_id, response.get_data(as_text=True))
        return response




@api_blueprint.route('/events', methods=['GET'])
def get_events():
    return jsonify({'events': []}), 200
