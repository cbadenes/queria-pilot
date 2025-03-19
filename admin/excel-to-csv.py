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

def convert_excel_to_csv(excel_file: str, csv_file: str, start_row: int = 1):
    """
    Convierte el archivo Excel a CSV con el formato requerido:
    email,nombre,acción

    :param excel_file: Ruta al archivo Excel de entrada
    :param csv_file: Ruta al archivo CSV de salida
    :param start_row: Fila a partir de la cual empezar a procesar (índice base 1, por defecto 1)
    """
    try:
        # Leer el archivo Excel
        logger.info(f"Leyendo archivo Excel: {excel_file}")
        df = pd.read_excel(excel_file)

        # Ajustar según fila de inicio (restamos 1 porque pandas usa índice base 0)
        if start_row > 1:
            logger.info(f"Procesando a partir de la fila {start_row}")
            df = df.iloc[start_row-1:]
            # Reiniciar el índice
            df = df.reset_index(drop=True)

        # Verificar que existan las columnas necesarias
        required_columns = ['Nombre', 'Email']
        if not all(col in df.columns for col in required_columns):
            raise ValueError("El archivo Excel debe contener las columnas: Nombre y Email")

        # Procesar las columnas
        processed_data = []
        for _, row in df.iterrows():
            # Verificar que el email no esté vacío
            if pd.isna(row['Email']) or str(row['Email']).strip() == '':
                logger.warning(f"Email vacío para {row['Nombre']}. Se omitirá esta fila.")
                continue

            email = str(row['Email']).strip()
            # Normalizar el nombre (quitar tildes y caracteres especiales)
            nombre = row['Nombre']
            if pd.isna(nombre) or nombre.strip() == '':
                logger.warning(f"Nombre vacío para {email}. Se omitirá esta fila.")
                continue

            name = unidecode.unidecode(str(nombre).strip()).upper()

            # Fijar el estado a 'new' para todos los usuarios
            action = 'new'

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
    parser.add_argument('--start-row', '-s', type=int, default=1,
                        help='Fila a partir de la cual empezar a procesar (índice base 1, por defecto 1)')

    args = parser.parse_args()
    convert_excel_to_csv(args.excel_file, args.output, args.start_row)

if __name__ == "__main__":
    main()