
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

## User Management

To create, reset or remove users in QuerIA, use the `user-management.py` script located in the `admin` directory.

### User File Format
The script processes a users.txt file with one line per user:
   ```bash
   email,name,action
   ````

- email: user's email
- name: user's full name
- action: new (create), reset (reset password), remove (delete user and their data)
Example:
   ```bash
   jane.doe@example.com,Jane Doe,new
   john.smith@example.com,John Smith,reset
   ```

### Secure Configuration with .env
Store sensitive information in a .env file (do not commit it to Git):
   ```bash
   MONGO_URI=mongodb://myuser:mypassword@localhost:27017/queria
   SMTP_USER=noreply.queria@gmail.com
   SMTP_PASSWORD=your_smtp_password
   ```

Install the required package:
   ```bash
   pip install python-dotenv
   ```

### Running the Script

   ```bash
   python user-management.py users.txt
   ```

You can override any value with command-line options:
   ```bash
   python user-management.py users.txt \
    --mongo-uri <your_uri> \
    --smtp-user <your_email> \
    --smtp-password <your_password>
   ```

## Usage

Sign up and follow the interface instructions to upload a PDF and generate your questionnaire. You can customize questionnaire parameters before generation as needed.

## Contributions

Contributions are welcome. Please submit a pull request or open an issue to propose improvements or report problems.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
