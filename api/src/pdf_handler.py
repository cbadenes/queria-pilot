from flask import current_app as app
import os
from PyPDF2 import PdfReader
import traceback

def process_pdf(pdf_path):
    """
    Procesa un archivo PDF y extrae su texto, manejando archivos encriptados
    
    Args:
        pdf_path: Ruta al archivo PDF
    
    Returns:
        str: Texto extraído del PDF
        
    Raises:
        ValueError: Si el PDF está vacío o no contiene texto extraíble
        Exception: Para otros errores de procesamiento
    """
    try:
        # Verificar si el archivo existe
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"El archivo {pdf_path} no existe")
            
        reader = PdfReader(pdf_path)
        
        # Manejar PDFs encriptados
        if reader.is_encrypted:
            try:
                # Intentar desencriptar con contraseña vacía primero
                reader.decrypt('')
            except:
                app.logger.warning("PDF está encriptado y requiere contraseña")
                raise ValueError("El PDF está encriptado y no se puede procesar")
                
        # Extraer texto de todas las páginas
        text = ''
        for page in reader.pages:
            extracted_text = page.extract_text()
            if extracted_text:
                text += extracted_text
                
        # Verificar si se extrajo algún texto
        if not text.strip():
            raise ValueError("El PDF no contiene texto que se pueda extraer")
            
        return text
        
    except Exception as e:
        app.logger.error(f"Error procesando PDF: {str(e)}\n{traceback.format_exc()}")
        raise

def verify_pdf(file):
    """
    Verifica que el archivo sea un PDF válido
    
    Args:
        file: Objeto archivo de Flask
        
    Returns:
        bool: True si es válido
        
    Raises:
        ValueError: Si el archivo no es válido
    """
    if not file or file.filename == '':
        raise ValueError("No se ha seleccionado ningún archivo")
        
    if not file.filename.lower().endswith('.pdf'):
        raise ValueError("El archivo debe ser un PDF")
        
    return True