from PyPDF2 import PdfReader

def extract_questions(pdf_file):
    reader = PdfReader(pdf_file)
    text = ''
    for page in reader.pages:
        text += page.extract_text()
    return analyze_text_to_questions(text)

def analyze_text_to_questions(text):
    # Lógica para analizar el texto y formular preguntas
    return [{"question": "What is ...?", "answer": "It is ..."}]
