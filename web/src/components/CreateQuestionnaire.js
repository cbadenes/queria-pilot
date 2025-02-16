import React, { useState } from 'react';
import { Box, Grid, TextField, IconButton, MenuItem, Typography, Paper, Snackbar, Alert, Button } from '@mui/material';import StyledDropzone from './StyledDropzone';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';
import { Tooltip } from '@mui/material';

const orangeColor = '#FFD5B4';
const grayColor = '#f0f0f0';
const darkGrayColor = '#333333';

const CreateQuestionnaire = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('Medio');
  const [percentageFreeResponse, setPercentageFreeResponse] = useState(50);
  const [questionnaireName, setQuestionnaireName] = useState('');
  const userEmail = localStorage.getItem('userEmail');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info'); // Agregar estado para la severidad del snackbar
  const [includeOpenQuestions, setIncludeOpenQuestions] = useState(false);
  const [openQuestionsRatio, setOpenQuestionsRatio] = useState('balanced');


  const handleDiscard = () => {
    setFile(null);
  };

  const handleGenerate = async () => {
    // Primero, validamos los campos obligatorios
    if (!file || !questionnaireName || !numQuestions || !difficulty || !userEmail) {
      setSnackbarMessage('Por favor, completa todos los campos y selecciona un archivo PDF.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // El porcentaje es 0 si no se quieren preguntas abiertas, o el valor según la selección si sí se quieren
    const percentageFreeResponse = includeOpenQuestions ?
      (openQuestionsRatio === 'few' ? 25 :
       openQuestionsRatio === 'many' ? 75 : 50)
      : 0;

    // Mostrar mensaje de archivo recibido inmediatamente
    setSnackbarMessage('Archivo PDF recibido. Procesando cuestionario...');
    setSnackbarSeverity('info');
    setOpenSnackbar(true);

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('numQuestions', numQuestions);
    formData.append('difficulty', difficulty);
    formData.append('percentageFreeResponse', percentageFreeResponse);
    formData.append('name', questionnaireName);
    formData.append('email', userEmail);

    try {
      const response = await fetch(`${API_BASE_URL}/api/questionnaires`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 413) {
        setSnackbarMessage('El archivo PDF es demasiado grande. Por favor, utiliza un archivo más pequeño (máximo 20MB).');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      }

      if (response.ok) {
        setSnackbarMessage('Cuestionario solicitado con éxito.');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        setSnackbarMessage('Error creando el cuestionario: ' + errorData.error);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage('Error de conexión al servidor.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpenSnackbar(false);
    };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: grayColor }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600, backgroundColor: '#ffffff', borderRadius: '10px' }}>

        {/* Botón para volver al Dashboard */}
        <Tooltip title="Cancelar la creación del cuestionario" arrow>
          <IconButton
            color="primary"
            aria-label="back"
            onClick={() => navigate('/dashboard')}
            sx={{ fontSize: 30, mb: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>

        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 'bold',
            color: darkGrayColor,
            mb: 3,
            textAlign: 'center',
          }}
        >
          Crear Nuevo Cuestionario
        </Typography>

        <StyledDropzone file={file} setFile={setFile} />

        {/* Mostrar el icono de la papelera solo si hay un archivo cargado */}
        {file && (
          <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
            <IconButton
              color="error"
              aria-label="discard"
              onClick={handleDiscard}
              sx={{ fontSize: 30 }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre del Cuestionario"
              variant="outlined"
              value={questionnaireName}
              onChange={(e) => setQuestionnaireName(e.target.value)}
              sx={{ fontFamily: '"Poppins", sans-serif' }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Número de Preguntas"
              variant="outlined"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              sx={{ fontFamily: '"Poppins", sans-serif' }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Dificultad"
              variant="outlined"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              sx={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {['Fácil', 'Medio', 'Difícil'].map((option) => (
                <MenuItem key={option} value={option} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              ¿Desea incluir preguntas de respuesta libre?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={includeOpenQuestions ? "contained" : "outlined"}
                onClick={() => setIncludeOpenQuestions(true)}
                sx={{
                  backgroundColor: includeOpenQuestions ? orangeColor : 'transparent',
                  color: includeOpenQuestions ? darkGrayColor : 'inherit',
                  '&:hover': {
                    backgroundColor: includeOpenQuestions ? '#e6b28e' : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                Sí
              </Button>
              <Button
                variant={!includeOpenQuestions ? "contained" : "outlined"}
                onClick={() => {
                  setIncludeOpenQuestions(false);
                  setOpenQuestionsRatio('balanced');
                }}
                sx={{
                  backgroundColor: !includeOpenQuestions ? orangeColor : 'transparent',
                  color: !includeOpenQuestions ? darkGrayColor : 'inherit',
                  '&:hover': {
                    backgroundColor: !includeOpenQuestions ? '#e6b28e' : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                No
              </Button>
            </Box>
          </Grid>

          {includeOpenQuestions && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                ¿Qué proporción de preguntas de respuesta libre desea?
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={openQuestionsRatio === 'few' ? "contained" : "outlined"}
                  onClick={() => setOpenQuestionsRatio('few')}
                  sx={{
                    flex: 1,
                    backgroundColor: openQuestionsRatio === 'few' ? orangeColor : 'transparent',
                    color: openQuestionsRatio === 'few' ? darkGrayColor : 'inherit',
                    '&:hover': {
                      backgroundColor: openQuestionsRatio === 'few' ? '#e6b28e' : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  Pocas (25%)
                </Button>
                <Button
                  variant={openQuestionsRatio === 'balanced' ? "contained" : "outlined"}
                  onClick={() => setOpenQuestionsRatio('balanced')}
                  sx={{
                    flex: 1,
                    backgroundColor: openQuestionsRatio === 'balanced' ? orangeColor : 'transparent',
                    color: openQuestionsRatio === 'balanced' ? darkGrayColor : 'inherit',
                    '&:hover': {
                      backgroundColor: openQuestionsRatio === 'balanced' ? '#e6b28e' : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  Equilibrado (50%)
                </Button>
                <Button
                  variant={openQuestionsRatio === 'many' ? "contained" : "outlined"}
                  onClick={() => setOpenQuestionsRatio('many')}
                  sx={{
                    flex: 1,
                    backgroundColor: openQuestionsRatio === 'many' ? orangeColor : 'transparent',
                    color: openQuestionsRatio === 'many' ? darkGrayColor : 'inherit',
                    '&:hover': {
                      backgroundColor: openQuestionsRatio === 'many' ? '#e6b28e' : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  Mayoría (75%)
                </Button>
              </Box>
            </Grid>
          )}

          <Grid item xs={12} display="flex" justifyContent="center">
            <Tooltip title="Crear nuevo cuestionario" arrow>
                <IconButton
                  color="primary"
                  aria-label="generate"
                  onClick={handleGenerate}
                  sx={{ fontSize: 30, backgroundColor: orangeColor, color: darkGrayColor }}
                  disabled={!file || !questionnaireName}
                >
                  <SendIcon />
                </IconButton>
             </Tooltip>
          </Grid>
        </Grid>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} // Mover el Snackbar abajo a la izquierda
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default CreateQuestionnaire;
