
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

QuerIA is fully containerized and can be deployed using Docker Compose. This is the recommended setup for both development and production environments.

### Prerequisites

Make sure you have the following installed:

- Docker
- Docker Compose (v2+)

### Manual Setup


1. **Clone the repository**:
   ```bash
   git clone https://github.com/cbadenes/queria-pilot.git
   cd queria-pilot
   ```

2. **Configure environment variables**:
Create a .env file in the project root based on .env.example:
   ```bash
   cp .env.example .env
   ```
Edit .env and configure:
- MongoDB credentials
- RabbitMQ credentials
- SMTP configuration
- LLM (Ollama) endpoint
- Secret keys

Do not commit .env to version control.

3. **Build and start all services**:
   ```bash
   docker compose up --build
   ```

This will start:
- MongoDB
- Mongo Express (admin UI)
- RabbitMQ
- API (Flask)
- Worker (LLM consumer)
- Web frontend (React)
- Admin CLI container

4. **Access the services**:
- Web application → http://localhost:3000
- API → http://localhost:3500
- RabbitMQ Management → http://localhost:15672
- Mongo Express → http://localhost:8081   

5. **Stop the services**:
   ```bash
   docker compose down
   ```

To remove volumes (database reset):
   ```bash
   docker compose down -v
   ```


## User Management

User creation, password reset, and removal are managed through the admin service.

### User File Format
The users.txt file must contain one user per line:
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

### Run the admin tool
With Docker running:
   ```bash
   docker compose run --rm admin users.txt
   ```

This command:
- Connects to MongoDB inside the Docker network
- Creates or updates users
- Sends credentials via SMTP (if configured)
  
## Usage

Sign up and follow the interface instructions to upload a PDF and generate your questionnaire. You can customize questionnaire parameters before generation as needed.

## Contributions

Contributions are welcome. Please submit a pull request or open an issue to propose improvements or report problems.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
