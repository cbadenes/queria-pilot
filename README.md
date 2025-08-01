
<p align="center">
  <img src="https://github.com/cbadenes/queria/blob/main/docs/logo.png" alt="QuerIA Logo" width="200" height="200">
</p>

# QuerIA - Questionnaire Generator

QuerIA is a platform designed to automatically generate educational questionnaires from PDF documents using Natural Language Processing (NLP) techniques. It simplifies the creation of customized assessments by allowing users to upload instructional documents, configure parameters, and receive ready-to-use quizzes with real-time validation.

## Main Features

- **User registration and authentication**: Secure and personalized access.
- **PDF upload and analysis**: Converts document content into interactive questionnaires.
- **Questionnaire customization**: Set the number of questions, difficulty level, and response type.
- **Real-time validation**: Answer and receive immediate feedback.
- **Result export**: Export quizzes and responses in PDF format for review and storage.

## Technologies Used

- **Frontend**: Developed with React and React Router for a dynamic user experience.
- **Backend**: Python with Flask provides a robust and scalable API.
- **Database**: Compatible with PostgreSQL or MongoDB.
- **Authentication**: Secure access via JWT (JSON Web Tokens).

## Setup and Execution

### Prerequisites

Make sure you have the following installed:

- Node.js and npm (or yarn)
- Python 3
- Pipenv
- Docker and Docker Compose (optional but recommended)

### Manual Setup


1. **Clone the repository**:
   ```bash
   git clone https://github.com/cbadenes/queria-pilot.git
   cd queria-pilot
   ```

2. **Running services with Docker Compose**:
   ```bash
   cd docker
   docker-compose up -d
   ```

After services are up, you **can manually launch** the following modules

3. **Create a Python virtual environment and Install backend dependencies**:
   ```bash
   cd ..
   cd api  
   python3 -m venv .venv
   source .venv/bin/activate   # On Windows use: .venv\\Scripts\\activate
   pip install -r requirements.txt
   ```

4. **Start the LLM worker**:
   ```bash
   python app-worker.py
   ```

5. **Start the API** (in a separate terminal):
   ```bash
   python app-api.py
   ```

6. **Start the frontend** (in a separate terminal):
   ```bash
   cd ..
   cd web
   npm install
   npm start
   ```

Then open `http://localhost:3000` in your browser to access the application.


## Usage

Sign up and follow the interface instructions to upload a PDF and generate your questionnaire. You can customize questionnaire parameters before generation as needed.

## Contributions

Contributions are welcome. Please submit a pull request or open an issue to propose improvements or report problems.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
