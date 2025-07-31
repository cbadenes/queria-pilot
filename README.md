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

Ensure you have Node.js, npm (or yarn), Python 3, and Pipenv installed to manage dependencies.

### Environment Setup

1. **Clone the repository and configure the backend**:
    ```bash
    git clone https://github.com/cbadenes/queria-pilot.git
    cd queria-pilot/backend
    pip install -r requirements.txt
    python app-api.py
    ```

2. **Configure the frontend**:
    ```bash
    cd ../frontend
    npm install
    npm start
    ```

### Running Services with Docker

To use Docker for environment setup:
```bash
docker-compose up -d
````

Visit http://localhost:3000 to access the application.

## Usage
Sign up and follow the interface instructions to upload a PDF and generate your questionnaire. You can customize questionnaire parameters before generation as needed.

## Contributions
Contributions are welcome. Please submit a pull request or open an issue to propose improvements or report problems.

## License
This project is licensed under the MIT License. See the LICENSE file for details.