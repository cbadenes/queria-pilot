import pandas as pd
import unidecode
import argparse
import logging

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def convert_excel_to_csv(excel_file: str, csv_file: str):
    """
    Convierte el archivo Excel a CSV con el formato requerido:
    email,nombre,acción
    
    :param excel_file: Ruta al archivo Excel de entrada
    :param csv_file: Ruta al archivo CSV de salida
    """
    try:
        # Leer el archivo Excel
        logger.info(f"Leyendo archivo Excel: {excel_file}")
        df = pd.read_excel(excel_file)
        
        # Verificar las columnas necesarias
        required_columns = ['Email', 'Nombre', 'Estado']
        if not all(col in df.columns for col in required_columns):
            raise ValueError("El archivo Excel debe contener las columnas: Email, Nombre y Estado")
        
        # Procesar las columnas
        processed_data = []
        for _, row in df.iterrows():
            email = row['Email'].strip()
            # Normalizar el nombre (quitar tildes y caracteres especiales)
            name = unidecode.unidecode(row['Nombre'].strip()).upper()
            action = row['Estado'].strip().lower()
            
            # Verificar que la acción sea válida
            if action not in ['new', 'reset', 'remove']:
                logger.warning(f"Acción no válida para {email}: {action}. Se omitirá esta fila.")
                continue
                
            processed_data.append(f"{email},{name},{action}")
        
        # Escribir el archivo CSV
        logger.info(f"Escribiendo archivo CSV: {csv_file}")
        with open(csv_file, 'w', encoding='utf-8') as f:
            for line in processed_data:
                f.write(line + '\n')
                
        logger.info(f"Proceso completado. Se procesaron {len(processed_data)} usuarios.")
        
    except Exception as e:
        logger.error(f"Error al procesar el archivo: {e}")
        raise

def main():
    parser = argparse.ArgumentParser(description='Convierte archivo Excel de usuarios a CSV')
    parser.add_argument('excel_file', help='Ruta al archivo Excel con los usuarios')
    parser.add_argument('--output', '-o', default='usuarios.csv',
                       help='Ruta al archivo CSV de salida (default: usuarios.csv)')

    args = parser.parse_args()
    convert_excel_to_csv(args.excel_file, args.output)

if __name__ == "__main__":
    main()