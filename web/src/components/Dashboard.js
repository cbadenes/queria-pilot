import React, { useState, useEffect } from 'react';
import MuiAlert from '@mui/material/Alert';  // Componente para mostrar alertas
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImportExportIcon from '@mui/icons-material/ImportExport'; // Icono para exportar a Moodle
import { CssBaseline, Drawer, List, ListItem, Box, Snackbar, Menu, Fab, IconButton, Typography, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import HelpIcon from '@mui/icons-material/Help';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';  // Base URL for API requests
import logo from '../assets/images/queria-logo.png';  // Logo
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import axios from 'axios';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { Slider } from '@mui/material';
import { deepOrange } from '@mui/material/colors';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import Footer from './Footer';
import { Tooltip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { Grid } from '@mui/material';
import AboutButton from './AboutButton';
import QuestionRatingForm from './QuestionRatingForm';




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
  const [snackbarDuration, setSnackbarDuration] = useState(6000);
  const [anchorEl, setAnchorEl] = useState(null);
  const [comment, setComment] = useState('');
  const [likeDislike, setLikeDislike] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);  // Estado para la pregunta actual
  const [evaluationResult, setEvaluationResult] = useState({});
  const [ratingMenuAnchorEl, setRatingMenuAnchorEl] = useState(null);
  const [textRating, setTextRating] = useState('');
  const [rating, setRating] = useState({
    clarity: 2,
    complexity: 2,
    alignment: 2,
    quality: 2,
    pedagogical: 2,
    cognitive: 2,
    contextual: 2,
    originality: 2
  });
  const [ratingSubmitted, setRatingSubmitted] = useState({});
  const [allValidated, setAllValidated] = useState(false);
  const [evaluationMessage, setEvaluationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null); // Estado para el índice en hover
  const [openDialog, setOpenDialog] = useState(false); // Estado para controlar el diálogo de confirmación
  const [deleteId, setDeleteId] = useState(null); // Estado para el ID del cuestionario a borrar
  const [commentedQuestions, setCommentedQuestions] = useState({});
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [showExportAlert, setShowExportAlert] = useState(false);
  const [currentComment, setCurrentComment] = useState(null);




  useEffect(() => {
    const allValid = selectedQuestions.every(question => {
      const result = evaluationResult[question.id];
      return result && (result.correct === true || result.correct === false);
    });
    setAllValidated(allValid);
  }, [selectedQuestions, evaluationResult]);

   const allQuestionsHaveComments = () => {
     return selectedQuestions.every(question => commentedQuestions[question.id]);
   };


   const handleOpenRatingMenu = async (event, question) => {
     setRatingMenuAnchorEl(event.currentTarget);
     setCurrentQuestion(question);

     try {
       const response = await fetch(`${API_BASE_URL}/api/comments/${question.id}`);
       if (response.ok) {
         const data = await response.json();
         setRating(data.ratings);
         setTextRating(data.comment);
         setCurrentComment(data);
       } else if (response.status === 404) {
         setRating({
           clarity: 2,
           complexity: 2,
           alignment: 2,
           quality: 2,
           pedagogical: 2,
           cognitive: 2,
           contextual: 2,
           originality: 2
         });
         setTextRating('');
         setCurrentComment(null);
       }
     } catch (error) {
       console.error('Error fetching comment:', error);
       setRating({
         clarity: 2,
         complexity: 2,
         alignment: 2,
         quality: 2,
         pedagogical: 2,
         cognitive: 2,
         contextual: 2,
         originality: 2
       });
       setTextRating('');
       setCurrentComment(null);
     }
   };

  const handleCloseRatingMenu = () => {
    setRatingMenuAnchorEl(null);
    setCurrentComment(null);
    setTextRating('');
    setRating({
      writing: 2,
      difficulty: 2,
      relevance: 2,
      refinement: 2,
      examUtility: 2
    });
  };

  const QuestionRating = ({ onRatingChange }) => {
    const [writingQuality, setWritingQuality] = useState(3);
    const [difficultyAccuracy, setDifficultyAccuracy] = useState(false);
    const [overallQuality, setOverallQuality] = useState(3);

    useEffect(() => {
      onRatingChange({
        writingQuality,
        difficultyAccuracy,
        overallQuality
      });
    }, [writingQuality, difficultyAccuracy, overallQuality, onRatingChange]);

    // Resto del componente
  };


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
            const fetchedQuestionnaires = await response.json();

          // Aquí actualizas el estado con la nueva lista de cuestionarios
              setQuestionnaires(fetchedQuestionnaires);
          } else {
              console.error('Failed to fetch questionnaires:', response.statusText);
          }
      } catch (error) {
          console.error('Error fetching questionnaires:', error);
      }
    };

    // Establecer un intervalo para actualizar los cuestionarios
    const intervalId = setInterval(fetchQuestionnaires, 2000);
    fetchQuestionnaires(); // Llamar también inmediatamente para cargar inicialmente los datos

    // Función de limpieza para asegurar que el intervalo se limpie correctamente
    return () => clearInterval(intervalId);
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
      const response = await fetch(`${API_BASE_URL}/api/questionnaires/${id}/questions`);
      if (response.ok) {
        const data = await response.json();
        setSelectedQuestions(data);
        setSelectedQuestionnaireId(`${id}`);

        // Inicializar el estado de los comentarios
        const commentStatus = {};
        for (const question of data) {
          try {
            const commentResponse = await fetch(`${API_BASE_URL}/api/comments/${question.id}`);
            if (commentResponse.ok) {
              commentStatus[question.id] = true;
            }
          } catch (error) {
            console.error('Error checking comment status:', error);
          }
        }
        setRatingSubmitted(commentStatus);
        setCommentedQuestions(commentStatus);
      } else {
        console.error('Failed to fetch questionnaire details:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching questionnaire details:', error);
    }
  };

  const confirmDelete = (questionnaireId) => {
      setSelectedQuestionnaireId(questionnaireId); // Guarda el ID del cuestionario que se desea borrar
      setOpenConfirmDialog(true); // Abre el diálogo de confirmación
    };

  const handleDeleteQuestionnaire = async (questionnaireId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questionnaires/${questionnaireId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();

        setSnackbarMessage(`Cuestionario borrado correctamente. Preguntas eliminadas: ${data.deleted_questions}`);
        setOpenSnackbar(true);

        setQuestionnaires(prevQuestionnaires => prevQuestionnaires.filter(q => q.id !== questionnaireId));
        setSelectedQuestionnaireId(null); // Limpia la selección actual
        setTimeout(() => {
                setSelectedQuestions([]);
              }, 500); // Retrasa la limpieza de preguntas
      } else {
        throw new Error('Error al borrar el cuestionario.');
      }
    } catch (error) {
      console.error('Error en la petición al backend:', error);
      setSnackbarMessage('Error al borrar el cuestionario.');
      setOpenSnackbar(true);
    }
  };



  const exportPDF = async () => {
      if (!allQuestionsHaveComments()) {
          setShowExportAlert(true);
          setSnackbarMessage('Por favor, proporciona comentarios para todas las preguntas antes de exportar.');
          setSnackbarSeverity('warning');
          setOpenSnackbar(true);
          return;
      }

      const input = document.getElementById("questionsContainer");
      const iconsContainer = document.getElementById("iconsContainer");

      if (!input || !iconsContainer) {
          console.error("Elementos necesarios no están disponibles.");
          return;
      }

      // Guardar el estilo actual del contenedor y ocultarlo
      const originalDisplay = iconsContainer.style.display;
      iconsContainer.style.display = 'none';

      const canvas = await html2canvas(input, {
          backgroundColor: null,
          scale: 2
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save("cuestionario.pdf");

      // Restaurar el estilo original del contenedor de íconos
      iconsContainer.style.display = originalDisplay;
  };



  const exportToMoodleXML = async () => {
      if (!allQuestionsHaveComments()) {
          setShowExportAlert(true);
          setSnackbarMessage('Por favor, proporciona comentarios para todas las preguntas antes de exportar.');
          setSnackbarSeverity('warning');
          setOpenSnackbar(true);
          return;
      }

      try {
          // Obtener el nombre del cuestionario
          const currentQuestionnaire = questionnaires.find(q => q.id === selectedQuestionnaireId);

          // Función para normalizar texto (quitar tildes manteniendo la letra)
          const normalizeText = (text) => {
              return text.normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos
                        .trim()
                        .replace(/\s+/g, '_')            // Espacios a guiones bajos
                        .replace(/[^a-zA-Z0-9_-]/g, ''); // Elimina otros caracteres especiales
          };

          const filename = currentQuestionnaire?.name
              ? normalizeText(currentQuestionnaire.name)
              : 'cuestionario';

          const response = await fetch(`${API_BASE_URL}/api/export/moodle`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ questionnaireId: selectedQuestionnaireId })
          });

          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.setAttribute('download', `${filename}.xml`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);

      } catch (error) {
          console.error('Error exporting to Moodle XML:', error);
          setSnackbarMessage('Error al exportar el cuestionario');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
      }
  };

  // Function to render the icon based on the status of the questionnaire
  const renderIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <ScheduleIcon />;
      case 'in_progress':
        //return <EditIcon />;
        return <CheckCircleOutlineIcon />;
      case 'completed':
        return <CheckCircleOutlineIcon />;
      default:
        return <HelpIcon />;
    }
  };

  const handleValidate = async (question) => {
      const selected = selectedAnswer[question.id];
      const newEvaluationResult = { ...evaluationResult };  // Copia del estado actual

      // Mostrar mensaje de evaluación en progreso
      setSnackbarMessage('Evaluando respuesta...');
      setOpenSnackbar(true);
      setIsLoading(true);
      setTimeout(() => setOpenSnackbar(false), 3000);  // Asegura que se cierre el snackbar de progreso

          try {
              let result;
              if (question.type === 'multi') {
                        const isCorrect = selected === question.valid_answer;
                        result = { correct: isCorrect, color: isCorrect ? 'green' : 'red', message: isCorrect ? `Respuesta correcta! ${question.evidence}` : 'Respuesta incorrecta. Inténtalo de nuevo.' };
              } else if (question.type === 'open') {
                  const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                          questionId: question.id,
                          question: question.question,
                          difficulty: question.difficulty,
                          context: question.context,
                          response: selected
                      })
                  });

                  if (response.ok) {
                      const data = await response.json();
                      const score = data.score;
                      let color = 'red';  // Por defecto es rojo
                      if (score > 75) {
                          color = 'green';  // Verde para puntuaciones superiores a 75
                      } else if (score > 25) {
                          color = 'orange';  // Naranja para puntuaciones entre 25 y 75
                      }
                      result = { correct: score > 50, color: color, message: `${data.explanation}` };
                  } else {
                      throw new Error('Error al validar la respuesta.');
                  }
           }
           newEvaluationResult[question.id] = result;
         } catch (error) {
              console.error('Error en la petición al backend:', error);
              setSnackbarMessage('Error al validar la respuesta.');
              setOpenSnackbar(true);
              setTimeout(() => setOpenSnackbar(false), 2000);  // Asegura que se cierre el snackbar de progreso
         }
         setEvaluationResult(newEvaluationResult);
         setIsLoading(false);
  };




  // Función para cerrar el Snackbar
    const handleCloseSnackbar = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpenSnackbar(false);
    };


    const handleRatingSubmit = async () => {
      const payload = {
        id: currentQuestion.id,  // Asegúrate de tener acceso a currentQuestion.id
        qid: selectedQuestionnaireId,  // Asegúrate de tener acceso a selectedQuestionnaireId
        ratings: rating,  // Los valores del Slider
        comment: textRating  // El comentario adicional del usuario
      };

      try {
        const response = await fetch(`${API_BASE_URL}/api/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const data = await response.json();
          setSnackbarMessage(data.message);
          setOpenSnackbar(true);
          setRatingSubmitted(prev => ({...prev, [currentQuestion.id]: true}));  // Marca como enviada para esta pregunta específica
          // Actualizar el estado de comentarios
          setCommentedQuestions(prev => ({
            ...prev,
            [currentQuestion.id]: true
          }));
          setRating({ writing: 2, difficulty: 2, relevance: 2 });
        } else {
          console.error("Error al enviar la valoración:", response.statusText);
        }
      } catch (error) {
        console.error("Error en la petición al backend:", error);
      }

      handleCloseRatingMenu();  // Cierra el menú emergente
    };




  // Get the button style based on the status of the questionnaire
  const getButtonStyle = (status) => {
    let buttonStyle = {
      backgroundColor: '#FFFFFF', // Fondo blanco para todos los botones
      color: darkGrayColor, // Color de texto oscuro
      textTransform: 'none',
      fontWeight: 'bold',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: '#F0F0F0', // Gris claro para el hover
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }
    };

    if (status === 'scheduled') {
      buttonStyle.backgroundColor = '#e0e0e0'; // Gris para in_progress
      buttonStyle.color = '#a0a0a0'; // Texto en gris para in_progress
      buttonStyle.pointerEvents = 'none'; // Deshabilita la interacción
      buttonStyle.opacity = 0.5; // Semi-transparencia
    }

    return buttonStyle;
  };


  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <CssBaseline />

      {/* Logout icon at the top-right corner */}
      <AboutButton />
     <Box sx={{ position: 'fixed', top: 16, right: 20 }}>
       <Tooltip title="Cerrar sesión" arrow placement="left">
         <Fab
           color="primary"
           onClick={() => navigate('/')}
           sx={{
             backgroundColor: orangeColor,
             color: darkGrayColor,
             '&:hover': {
               backgroundColor: deepOrange[700]
             }
           }}
         >
           <LogoutIcon />
         </Fab>
       </Tooltip>
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
            <ListItem
              key={questionnaire.id}
              disablePadding
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Button
                  fullWidth
                  onClick={() => handleQuestionnaireClick(questionnaire.id)}
                  sx={getButtonStyle(questionnaire.status)} // Aplica estilos refinados
                  startIcon={renderIcon(questionnaire.status)} // Icono para cada estado
                  style={{ justifyContent: 'flex-start' }} // Justifica el icono a la izquierda
                >
                {questionnaire.name}
              </Button>
              {hoveredIndex === index && (
                <IconButton onClick={() => confirmDelete(questionnaire.id)} size="small">
                  <DeleteIcon />
                </IconButton>
              )}
            </ListItem>
          ))}
          <ListItem sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Tooltip title="Crear nuevo cuestionario" arrow placement="right">
              <Fab
                sx={{
                  backgroundColor: orangeColor,
                  color: darkGrayColor,
                  pointerEvents: 'auto',
                  marginLeft: 8,
                  '&:hover': {
                    backgroundColor: '#e6b28e'
                  }
                }}
                aria-label="add"
                onClick={() => navigate('/create-questionnaire')}
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          </ListItem>
        </List>

      </Drawer>
       <Dialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirmar Borrado"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              ¿Estás seguro de que deseas borrar este cuestionario y todas sus preguntas asociadas?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
              Cancelar
            </Button>
            <Button onClick={() => {
              handleDeleteQuestionnaire(selectedQuestionnaireId);
              setOpenConfirmDialog(false);
            }} color="primary" autoFocus>
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
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
            {/* Meta-información del cuestionario */}
            {questionnaires.map(q => q.id === selectedQuestionnaireId && (
              <Box key={q.id} sx={{
                mb: 4,
                p: 3,
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <Typography variant="h6" sx={{ mb: 2, color: darkGrayColor }}>
                  Información del Cuestionario
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Nombre:</strong> {q.name}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Archivo Original:</strong> {q.filename}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Fecha de Creación:</strong> {new Date(q.date).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Dificultad:</strong> {q.difficulty}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Número de Preguntas:</strong> {q.num_questions}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Ratio de Preguntas Abiertas:</strong> {q.ratio}%
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Box id="iconsContainer" sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%', mt: 2, mb: 4 }}>
                  <Tooltip title={allQuestionsHaveComments() ? "Exportar a PDF" : "Necesitas comentar todas las preguntas antes de exportar a PDF"} arrow>
                      <span>
                        <IconButton
                          onClick={exportPDF}
                          sx={{
                            backgroundColor: allQuestionsHaveComments() ? orangeColor : '#e0e0e0',
                            color: '#fff',
                            '&:hover': { backgroundColor: allQuestionsHaveComments() ? '#e6b28e' : '#e0e0e0' },
                            ml: 2,
                            cursor: allQuestionsHaveComments() ? 'pointer' : 'not-allowed'
                          }}
                          disabled={!allQuestionsHaveComments()}
                        >
                          <PictureAsPdfIcon />
                        </IconButton>
                      </span>
                  </Tooltip>
                  <Tooltip title={allQuestionsHaveComments() ? "Exportar a formato Moodle" : "Necesitas comentar todas las preguntas antes de exportar a Moodle"} arrow>
                      <span>
                        <IconButton
                          onClick={exportToMoodleXML}
                          sx={{
                            backgroundColor: allQuestionsHaveComments() ? orangeColor : '#e0e0e0',
                            color: '#fff',
                            '&:hover': { backgroundColor: allQuestionsHaveComments() ? '#e6b28e' : '#e0e0e0' },
                            ml: 2,
                            cursor: allQuestionsHaveComments() ? 'pointer' : 'not-allowed'
                          }}
                          disabled={!allQuestionsHaveComments()}
                        >
                          <SchoolIcon />
                        </IconButton>
                      </span>
                  </Tooltip>
                  <Tooltip title="Eliminar cuestionario" arrow>
                    <IconButton onClick={() => confirmDelete(selectedQuestionnaireId)} sx={{ backgroundColor: orangeColor, color: '#fff', '&:hover': { backgroundColor: '#e6b28e' }, ml: 2 }}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
             </Box>
            {selectedQuestions.map((question, index) => (
              <Box key={index} sx={{ mb: 3, border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
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
                {!isLoading && evaluationResult[question.id] && (
                    <Typography color={evaluationResult[question.id].color || 'default'} sx={{ mt: 2 }}>
                        {evaluationResult[question.id].message}
                    </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Tooltip title="Validar respuesta" arrow>
                      <IconButton
                        aria-label="validate"
                        onClick={() => handleValidate(question)}
                        sx={{ color: evaluationResult[question.id]?.color || 'default' }}
                      >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                 <Tooltip title="Valorar pregunta" arrow>
                     <IconButton
                       onClick={(event) => handleOpenRatingMenu(event, question)}
                       sx={{ color: ratingSubmitted[question.id] ? orangeColor : 'default' }}
                     >
                       <RateReviewIcon />
                     </IconButton>
                   </Tooltip>
                  <Menu
                    anchorEl={ratingMenuAnchorEl}
                    open={Boolean(ratingMenuAnchorEl)}
                    onClose={handleCloseRatingMenu}
                    PaperProps={{
                      style: {
                        maxHeight: '90vh',
                      }
                    }}
                  >
                    <QuestionRatingForm
                      rating={rating}
                      setRating={setRating}
                      textRating={textRating}
                      setTextRating={setTextRating}
                      orangeColor={orangeColor}
                      onClose={handleRatingSubmit}
                      questionType={currentQuestion?.type}
                    />
                  </Menu>
                </Box>
              </Box>
            ))}
              <Dialog
                open={openConfirmDialog}
                onClose={() => setOpenConfirmDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">{"Confirmar Borrado"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    ¿Estás seguro de que deseas borrar este cuestionario y todas sus preguntas asociadas?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    handleDeleteQuestionnaire(selectedQuestionnaireId);
                    setOpenConfirmDialog(false);
                  }} color="primary" autoFocus>
                    Confirmar
                  </Button>
                </DialogActions>
              </Dialog>
          </Box>
        ) : (
          <Typography variant="h6" sx={{ color: '#888' }}>
            Selecciona un cuestionario para ver las preguntas
          </Typography>
        )}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
        />
      </Box>
      <Footer />
    </Box>
  );
};

export default Dashboard;
