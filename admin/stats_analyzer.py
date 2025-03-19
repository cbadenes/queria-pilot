#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import streamlit as st
import pandas as pd
import json
import os
import matplotlib.pyplot as plt
import seaborn as sns
import datetime
from glob import glob

# Configuración de la página
st.set_page_config(
    page_title="Queria - Análisis de Datos",
    page_icon="📊",
    layout="wide"
)

# Funciones de utilidad
def load_json_file(file_path):
    """Carga un archivo JSON en un DataFrame de pandas"""
    try:
        # Para archivos exportados con bsondump, necesitamos leer línea por línea
        data = []
        with open(file_path, 'r') as f:
            for line in f:
                try:
                    data.append(json.loads(line))
                except json.JSONDecodeError:
                    pass  # Ignorar líneas que no sean JSON válido
        return pd.DataFrame(data)
    except Exception as e:
        st.error(f"Error al cargar archivo {file_path}: {e}")
        return pd.DataFrame()

def find_backup_folders(base_dir="./mongo-backups"):
    """Encuentra todas las carpetas de backup disponibles"""
    backup_folders = glob(os.path.join(base_dir, "*"))
    return sorted([f for f in backup_folders if os.path.isdir(f)], reverse=True)

def format_date_from_folder(folder_name):
    """Extrae y formatea la fecha a partir del nombre de la carpeta"""
    try:
        base = os.path.basename(folder_name)
        date_part = base.split("_")[0]
        time_part = base.split("_")[1]
        return f"{date_part} {time_part.replace('-', ':')}"
    except:
        return folder_name

# Título y descripción
st.title("📊 Análisis de Datos de Queria")
st.markdown("Esta herramienta permite analizar los datos exportados de la base de datos MongoDB de Queria.")

# Selector de backup
st.sidebar.header("Selección de Datos")
backup_folders = find_backup_folders()

if not backup_folders:
    st.warning("No se encontraron carpetas de backup. Ejecuta el script de backup primero.")
else:
    selected_backup = st.sidebar.selectbox(
        "Selecciona un backup para analizar:",
        options=backup_folders,
        format_func=format_date_from_folder
    )
    
    # Cargar datos
    st.sidebar.subheader("Colecciones")
    collections = ["comments", "questions", "questionnaires", "users"]
    
    # Verificar qué colecciones están disponibles en este backup
    available_collections = []
    for collection in collections:
        json_path = os.path.join(selected_backup, f"{collection}.json")
        if os.path.exists(json_path):
            available_collections.append(collection)
    
    if not available_collections:
        st.warning(f"No se encontraron archivos JSON en el backup seleccionado: {selected_backup}")
    else:
        # Cargar datos cuando se seleccione un backup
        data = {}
        with st.spinner("Cargando datos..."):
            for collection in available_collections:
                json_path = os.path.join(selected_backup, f"{collection}.json")
                data[collection] = load_json_file(json_path)
        
        st.success(f"Datos cargados correctamente del backup: {format_date_from_folder(selected_backup)}")
        
        # Métricas globales
        st.header("Métricas Globales")
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            if "users" in data:
                st.metric("Usuarios", len(data["users"]))
            else:
                st.metric("Usuarios", "N/A")
                
        with col2:
            if "questionnaires" in data:
                st.metric("Cuestionarios", len(data["questionnaires"]))
            else:
                st.metric("Cuestionarios", "N/A")
                
        with col3:
            if "questions" in data:
                st.metric("Preguntas", len(data["questions"]))
            else:
                st.metric("Preguntas", "N/A")
                
        with col4:
            if "comments" in data:
                st.metric("Comentarios", len(data["comments"]))
            else:
                st.metric("Comentarios", "N/A")
        
        # Visualizaciones
        st.header("Visualizaciones")
        
        tab1, tab2, tab3, tab4 = st.tabs(["Cuestionarios", "Preguntas", "Usuarios", "Comentarios"])
        
        with tab1:
            if "questionnaires" in data and not data["questionnaires"].empty:
                st.subheader("Análisis de Cuestionarios")
                
                # Extraer y convertir fechas si existen
                if "createdAt" in data["questionnaires"].columns:
                    try:
                        data["questionnaires"]["createdAt"] = pd.to_datetime(data["questionnaires"]["createdAt"]["$date"], errors="coerce")
                        
                        # Gráfico de cuestionarios por mes
                        st.subheader("Cuestionarios creados por mes")
                        monthly_questionnaires = data["questionnaires"].set_index("createdAt").resample("M").size()
                        fig, ax = plt.subplots(figsize=(10, 6))
                        monthly_questionnaires.plot(kind="bar", ax=ax)
                        plt.title("Cuestionarios creados por mes")
                        plt.ylabel("Número de cuestionarios")
                        plt.xlabel("Mes")
                        st.pyplot(fig)
                    except:
                        st.warning("No se pudieron procesar las fechas de creación de los cuestionarios")
                
                # Mostrar datos en una tabla expandible
                with st.expander("Ver datos de cuestionarios"):
                    st.dataframe(data["questionnaires"])
            else:
                st.info("No hay datos de cuestionarios disponibles")
        
        with tab2:
            if "questions" in data and not data["questions"].empty:
                st.subheader("Análisis de Preguntas")
                
                # Contar tipos de preguntas si existe la columna
                if "type" in data["questions"].columns:
                    question_types = data["questions"]["type"].value_counts()
                    
                    st.subheader("Distribución de tipos de preguntas")
                    fig, ax = plt.subplots(figsize=(10, 6))
                    question_types.plot(kind="pie", autopct="%1.1f%%", ax=ax)
                    plt.title("Tipos de preguntas")
                    st.pyplot(fig)
                
                # Mostrar datos en una tabla expandible
                with st.expander("Ver datos de preguntas"):
                    st.dataframe(data["questions"])
            else:
                st.info("No hay datos de preguntas disponibles")
        
        with tab3:
            if "users" in data and not data["users"].empty:
                st.subheader("Análisis de Usuarios")
                
                # Extraer y convertir fechas si existen
                if "createdAt" in data["users"].columns:
                    try:
                        data["users"]["createdAt"] = pd.to_datetime(data["users"]["createdAt"]["$date"], errors="coerce")
                        
                        # Gráfico de usuarios por mes
                        st.subheader("Usuarios registrados por mes")
                        monthly_users = data["users"].set_index("createdAt").resample("M").size()
                        fig, ax = plt.subplots(figsize=(10, 6))
                        monthly_users.plot(kind="bar", ax=ax)
                        plt.title("Usuarios registrados por mes")
                        plt.ylabel("Número de usuarios")
                        plt.xlabel("Mes")
                        st.pyplot(fig)
                    except:
                        st.warning("No se pudieron procesar las fechas de creación de los usuarios")
                
                # Mostrar datos en una tabla expandible
                with st.expander("Ver datos de usuarios"):
                    # Excluir campos sensibles como contraseñas
                    safe_user_data = data["users"].drop(columns=["password", "passwordHash"], errors="ignore")
                    st.dataframe(safe_user_data)
            else:
                st.info("No hay datos de usuarios disponibles")
        
        with tab4:
            if "comments" in data and not data["comments"].empty:
                st.subheader("Análisis de Comentarios")
                
                # Extraer y convertir fechas si existen
                if "createdAt" in data["comments"].columns:
                    try:
                        data["comments"]["createdAt"] = pd.to_datetime(data["comments"]["createdAt"]["$date"], errors="coerce")
                        
                        # Gráfico de comentarios por mes
                        st.subheader("Comentarios por mes")
                        monthly_comments = data["comments"].set_index("createdAt").resample("M").size()
                        fig, ax = plt.subplots(figsize=(10, 6))
                        monthly_comments.plot(kind="bar", ax=ax)
                        plt.title("Comentarios por mes")
                        plt.ylabel("Número de comentarios")
                        plt.xlabel("Mes")
                        st.pyplot(fig)
                    except:
                        st.warning("No se pudieron procesar las fechas de creación de los comentarios")
                
                # Mostrar datos en una tabla expandible
                with st.expander("Ver datos de comentarios"):
                    st.dataframe(data["comments"])
            else:
                st.info("No hay datos de comentarios disponibles")
        
        # Análisis cruzado entre colecciones
        st.header("Análisis Cruzado")
        
        if "questionnaires" in data and "questions" in data and not data["questionnaires"].empty and not data["questions"].empty:
            st.subheader("Relación entre cuestionarios y preguntas")
            
            # Intentar relacionar cuestionarios con sus preguntas
            try:
                # Este análisis dependerá de la estructura exacta de tus datos
                # Asumimos que hay una relación entre questionnaires._id y questions.questionnaireId
                if "questions" in data and "questionnaires" in data:
                    questions_per_questionnaire = data["questions"].groupby("questionnaireId").size().reset_index(name="count")
                    
                    fig, ax = plt.subplots(figsize=(10, 6))
                    sns.histplot(questions_per_questionnaire["count"], kde=True, ax=ax)
                    plt.title("Distribución de preguntas por cuestionario")
                    plt.xlabel("Número de preguntas")
                    plt.ylabel("Frecuencia")
                    st.pyplot(fig)
            except:
                st.warning("No se pudo analizar la relación entre cuestionarios y preguntas")
        
        # Exportación de estadísticas
        st.header("Exportar Estadísticas")
        
        if st.button("Generar informe de estadísticas en CSV"):
            # Crear un directorio para estadísticas si no existe
            stats_dir = "./estadisticas"
            os.makedirs(stats_dir, exist_ok=True)
            
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            stats_file = os.path.join(stats_dir, f"estadisticas_{timestamp}.csv")
            
            # Recopilar estadísticas básicas
            stats = {
                "fecha_analisis": [datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")],
                "backup_analizado": [format_date_from_folder(selected_backup)],
                "total_usuarios": [len(data.get("users", pd.DataFrame()))],
                "total_cuestionarios": [len(data.get("questionnaires", pd.DataFrame()))],
                "total_preguntas": [len(data.get("questions", pd.DataFrame()))],
                "total_comentarios": [len(data.get("comments", pd.DataFrame()))]
            }
            
            # Crear DataFrame de estadísticas y exportar a CSV
            stats_df = pd.DataFrame(stats)
            stats_df.to_csv(stats_file, index=False)
            
            st.success(f"Estadísticas exportadas a: {stats_file}")

# Información de la aplicación
st.sidebar.markdown("---")
st.sidebar.info(
    """
    **Sobre esta aplicación**
    
    Esta herramienta de análisis permite:
    - Visualizar estadísticas de la base de datos MongoDB
    - Analizar tendencias temporales
    - Exportar informes para su posterior análisis
    
    Desarrollada para el sistema Queria
    """
)
