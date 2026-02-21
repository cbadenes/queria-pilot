FROM python:3.11-slim

WORKDIR /app

RUN pip install pymongo python-dotenv bcrypt

COPY . .

ENTRYPOINT ["python", "user-management.py"]