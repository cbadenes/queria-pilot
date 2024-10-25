import React, { useState, useEffect } from 'react';
import MuiAlert from '@mui/material/Alert';  // Componente para mostrar alertas
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImportExportIcon from '@mui/icons-material/ImportExport'; // Icono para exportar a Moodle
import { CssBaseline, Drawer, List, ListItem, Box, Snackbar, Menu, MenuItem, TextFields, Fab, IconButton, Typography, Button, Divider } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import { TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { green, grey } from '@mui/material/colors';  // Importa los colores
import API_BASE_URL from './config';  // Base URL for API requests
import logo from '../assets/images/queria-logo.png';  // Logo
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import axios from 'axios';


const orangeColor = '#FFD5B4';  // Color for the "Create" button
const darkGrayColor = '#333333';  // Color for the text
const lightBackground = '#fafafa';  // Lighter background for the questionnaire list

// Definir el componente de alerta para el Snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);  // Store the list of questions for the selected questionnaire
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState({});  // Almacena las respuestas seleccionadas por el usuario
  const [openSnackbar, setOpenSnackbar] = useState(false);  // Estado para controlar el Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState('');  // Almacena el mensaje a mostrar en el Snackbar
  const [anchorEl, setAnchorEl] = useState(null);
  const [comment, setComment] = useState('');
  const [likeDislike, setLikeDislike] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);  // Estado para la pregunta actual
  const [evaluationResult, setEvaluationResult] = useState({});


  // Función para seleccionar un cuestionario
  const selectQuestionnaire = (id) => {
   setSelectedQuestionnaireId(id);
  };

  const handleCommentIconClick = (event, question) => {
    setAnchorEl(event.currentTarget);
    setCurrentQuestion(question);  // Guarda la referencia a la pregunta actual
  };

    const handleCloseMenu = () => {
      setAnchorEl(null);
      setLikeDislike(null);
      setComment('');
    };

   // Esta función se llama cuando se presiona el botón de enviar en el menú de comentarios
   const handleSendComment = async () => {
     const dataToSend = {
       question: currentQuestion,
       comment: comment,
       likeDislike: likeDislike
     };

     try {
       const result = await fetch(`${API_BASE_URL}/api/comments`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(dataToSend)
       });
       if (result.ok) {
         const response = await result.json();
         console.log("Comentario enviado con éxito:", response.message);
         setOpenSnackbar(true);  // Abre el Snackbar con el mensaje de confirmación
         setSnackbarMessage(response.message);  // Configura el mensaje del Snackbar
         handleCloseMenu();  // Cierra el menú de comentarios
       } else {
         console.error("Error al enviar el comentario:", result.statusText);
       }
     } catch (error) {
       console.error("Error en la petición al backend:", error);
     }
   };

  // Fetch questionnaires from the backend
  useEffect(() => {
    const fetchQuestionnaires = async () => {
      const userEmail = localStorage.getItem('userEmail'); // Asume que el email está almacenado en localStorage
      try {
        const response = await fetch(`${API_BASE_URL}/api/questionnaires?email=${encodeURIComponent(userEmail)}`);
        if (response.ok) {
          const data = await response.json();
          setQuestionnaires(data.questionnaires);
        } else {
          console.error('Failed to fetch questionnaires:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching questionnaires:', error);
      }
    };

    fetchQuestionnaires();
  }, []);

  // Disable scrolling on page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';  // Restore scrolling when component is unmounted
    };
  }, []);

  // Function to handle questionnaire selection and fetch its details
  const handleQuestionnaireClick = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questionnaires/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedQuestions(data);  // Store the list of questions
        setSelectedQuestionnaireId(`${id}`);
      } else {
        console.error('Failed to fetch questionnaire details:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching questionnaire details:', error);
    }
  };

  const exportPDF = async () => {
    const input = document.getElementById("questionsContainer");
    const pdfIcon = document.getElementById("pdfIcon");

    // Guardar el estilo actual del icono
    const originalDisplay = pdfIcon.style.display;

    // Aplica estilos temporales para la exportación
    pdfIcon.style.display = 'none';  // Ocultar el icono durante la captura

    const canvas = await html2canvas(input, {
      backgroundColor: null,  // Asegúrate de que html2canvas no use un fondo por defecto
      logging: true,
      scale: 2,  // Aumenta la escala para mejorar la calidad de la imagen
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save("cuestionario.pdf");

    // Restaurar el estilo original del icono
    pdfIcon.style.display = originalDisplay;
  };


  const exportToMoodleXML = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/export/moodle`, { questionnaireId: selectedQuestionnaireId });
      const xmlData = response.data; // Suponiendo que el backend responde con el XML en el cuerpo de la respuesta
      const blob = new Blob([xmlData], { type: 'application/xml' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'cuestionario_moodle.xml'); // Nombre del archivo XML
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error exporting to Moodle XML:', error);
    }
  };

  // Function to render the icon based on the status of the questionnaire
  const renderIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <ScheduleIcon />;
      case 'in_progress':
        return <PlayCircleOutlineIcon />;
      case 'completed':
        return <CheckCircleOutlineIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const handleValidate = (question) => {
    if (question.type === 'multi') {
      const selected = selectedAnswer[question.id];
      if (selected === question.valid_answer) {
        setEvaluationResult({
          ...evaluationResult,
          [question.id]: { correct: true, color: 'green' }
        });
        setSnackbarMessage('Respuesta correcta!');
        setOpenSnackbar(true);
      } else {
        setEvaluationResult({
          ...evaluationResult,
          [question.id]: { correct: false, color: 'red' }
        });
        setSnackbarMessage('Respuesta incorrecta. Inténtalo de nuevo.');
        setOpenSnackbar(true);
      }
    }
  };

  // Función para cerrar el Snackbar
    const handleCloseSnackbar = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpenSnackbar(false);
    };

  // Get the button style based on the status of the questionnaire
  const getButtonStyle = (status) => {
    let hoverColor = '#F0F0F0';  // Default hover color
    if (status === 'scheduled') hoverColor = '#ECEFF1';  // Light gray for scheduled
    if (status === 'in_progress') hoverColor = '#E3F2FD';  // Light blue for in-progress
    if (status === 'completed') hoverColor = '#E8F5E9';  // Light green for completed

    return {
      backgroundColor: '#FFFFFF',  // White background for all buttons
      color: darkGrayColor,  // Dark text color
      textTransform: 'none',
      fontWeight: 'bold',
      borderRadius: '8px',  // Rounded corners for a softer look
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',  // Light shadow for a floating effect
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: hoverColor,  // Change background color on hover based on status
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',  // Stronger shadow on hover
      }
    };
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <CssBaseline />

      {/* Logout icon at the top-right corner */}
      <Box sx={{ position: 'absolute', top: 56, right: 16 }}>
        <IconButton color="inherit" onClick={() => navigate('/')} sx={{ color: darkGrayColor }}>
          <LogoutIcon />
        </IconButton>
      </Box>

      {/* Sidebar - List of Questionnaires */}
      <Drawer
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: lightBackground,  // Light background for the drawer
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* Sidebar header with QuerIA logo */}
        <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #ddd' }}>
          <img src={logo} alt="Logo QuerIA" style={{ maxWidth: '100px', marginBottom: '10px' }} />  {/* QuerIA logo */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              mb: 1,
              fontFamily: '"Poppins", sans-serif',
              color: darkGrayColor,
            }}
          >
            Cuestionarios
          </Typography>
        </Box>

        {/* Questionnaire List */}
        <List>
          {questionnaires.map((questionnaire, index) => (
            <ListItem key={index} disablePadding>
              <Button
                fullWidth
                onClick={() => handleQuestionnaireClick(questionnaire.id)}
                sx={getButtonStyle(questionnaire.status)}  // Apply refined button styles
                startIcon={renderIcon(questionnaire.status)}  // Icon for each status
                style={{ justifyContent: 'flex-start' }}  // Justify icon to the left
              >
                {questionnaire.name}
              </Button>
            </ListItem>
          ))}
        </List>

        {/* Add new questionnaire button */}
        <Box sx={{ p: 2, position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
          <Fab sx={{ backgroundColor: orangeColor, color: darkGrayColor }} aria-label="add" onClick={() => navigate('/create-questionnaire')}>
            <AddIcon />
          </Fab>
        </Box>
      </Drawer>

      {/* Main Content - Show list of questions on the right */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          minHeight: '100vh',
          textAlign: 'center',
          overflow: 'hidden',  // Prevent page scrolling
        }}
      >
        {selectedQuestions.length > 0 ? (
          <Box id="questionsContainer" sx={{ p: 4, width: '80%', textAlign: 'left', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              Preguntas del Cuestionario
            </Typography>
            {selectedQuestions.map((question, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {question.question}
                </Typography>
                {question.type === 'open' ? (
                  <TextField
                    label="Tu respuesta"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    onChange={(e) => {
                      setSelectedAnswer({ ...selectedAnswer, [question.id]: e.target.value });
                      setEvaluationResult({ ...evaluationResult, [question.id]: { color: 'default' } });  // Reset color to default when answer changes
                    }}
                  />
                ) : (
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend">Elige una respuesta</FormLabel>
                    <RadioGroup
                      value={selectedAnswer[question.id]}  // Ensure the RadioGroup is controlled
                      onChange={(e) => {
                        setSelectedAnswer({ ...selectedAnswer, [question.id]: e.target.value });
                        setEvaluationResult({ ...evaluationResult, [question.id]: { color: 'default' } });  // Reset color to default when answer changes
                      }}
                    >
                      {question.answers.map((answer, idx) => (
                        <FormControlLabel key={idx} value={answer} control={<Radio />} label={answer} />
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <IconButton
                    aria-label="validate"
                    onClick={() => handleValidate(question)}
                    sx={{ color: evaluationResult[question.id]?.color || 'default' }}  // Use color based on evaluation result
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton onClick={(event) => handleCommentIconClick(event, question)}>
                    <CommentIcon />
                  </IconButton>
                  {currentQuestion && currentQuestion.id === question.id && (
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleCloseMenu}
                    >
                      <MenuItem>
                        <TextField
                          fullWidth
                          label="Escribe un comentario"
                          variant="outlined"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </MenuItem>
                      <MenuItem>
                        <IconButton
                          color={likeDislike === 'like' ? 'primary' : 'default'}
                          onClick={() => setLikeDislike('like')}
                        >
                          <ThumbUpIcon />
                        </IconButton>
                        <IconButton
                          color={likeDislike === 'dislike' ? 'primary' : 'default'}
                          onClick={() => setLikeDislike('dislike')}
                        >
                          <ThumbDownIcon />
                        </IconButton>
                      </MenuItem>
                      <MenuItem>
                        <Button
                          variant="contained"
                          color="primary"
                          endIcon={<SendIcon />}
                          onClick={handleSendComment}
                        >
                          Enviar
                        </Button>
                      </MenuItem>
                    </Menu>
                  )}
                </Box>
              </Box>
            ))}
            {/* Icono para exportar a PDF, colocado a la derecha */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '80%', mt: 2 }}>
                <IconButton onClick={exportPDF} sx={{ backgroundColor: orangeColor, color: '#fff', '&:hover': { backgroundColor: '#e6b28e' } }}>
                  <PictureAsPdfIcon />
                </IconButton>
                <IconButton onClick={exportToMoodleXML} sx={{ backgroundColor: orangeColor, color: '#fff', ml: 1, '&:hover': { backgroundColor: '#e6b28e' } }}>
                  <ImportExportIcon />
                </IconButton>
              </Box>
            <Snackbar
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              message={snackbarMessage}
            />
          </Box>
        ) : (
          <Typography variant="h6" sx={{ color: '#888' }}>
            Selecciona un cuestionario para ver las preguntas
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
