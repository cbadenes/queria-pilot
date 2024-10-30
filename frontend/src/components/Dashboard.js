import React, { useState, useEffect } from 'react';
import MuiAlert from '@mui/material/Alert';  // Componente para mostrar alertas
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImportExportIcon from '@mui/icons-material/ImportExport'; // Icono para exportar a Moodle
import { CssBaseline, Drawer, List, ListItem, Box, Snackbar, Menu, Fab, IconButton, Typography, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import HelpIcon from '@mui/icons-material/Help';
import SendIcon from '@mui/icons-material/Send';
import { TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { grey } from '@mui/material/colors';  // Importa los colores
import API_BASE_URL from './config';  // Base URL for API requests
import logo from '../assets/images/queria-logo.png';  // Logo
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { Slider } from '@mui/material';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import { deepOrange } from '@mui/material/colors';

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
  const [ratingMenuAnchorEl, setRatingMenuAnchorEl] = useState(null);
  const [textRating, setTextRating] = useState('');
  const [rating, setRating] = useState({
    writing: 2,  // Valor inicial definido
    difficulty: 2,  // Valor inicial definido
    relevance: 2  // Valor inicial definido
  });
  const [ratingSubmitted, setRatingSubmitted] = useState({});
  const [allValidated, setAllValidated] = useState(false);


  useEffect(() => {
    const allValid = selectedQuestions.every(question => {
      const result = evaluationResult[question.id];
      return result && (result.correct === true || result.correct === false);
    });
    setAllValidated(allValid);
  }, [selectedQuestions, evaluationResult]);


   const handleOpenRatingMenu = (event, question) => {
    setRatingMenuAnchorEl(event.currentTarget);
    setCurrentQuestion(question);  // Establece la pregunta actual al abrir el menú
  };

  const handleCloseRatingMenu = () => {
    setRatingMenuAnchorEl(null);
    setTextRating('');
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
    const intervalId = setInterval(fetchQuestionnaires, 120000);
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
        return <EditIcon />;
      case 'completed':
        return <CheckCircleOutlineIcon />;
      default:
        return <HelpIcon />;
    }
  };

  const handleSubmitResults = async () => {
    const payload = {
      questionnaireId: selectedQuestionnaireId,
      answers: selectedAnswer
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        setSnackbarMessage(data.message);
        setOpenSnackbar(true);
        // Actualizar el estado en el frontend si es necesario
        const updatedQuestionnaires = questionnaires.map(q =>
          q.id === selectedQuestionnaireId ? { ...q, status: 'completed' } : q
        );
        setQuestionnaires(updatedQuestionnaires);
      } else {
        console.error("Error al enviar los resultados:", response.statusText);
      }
    } catch (error) {
      console.error("Error en la petición al backend:", error);
    }
  };


  const handleValidate = async (question) => {
      const selected = selectedAnswer[question.id];
      const newEvaluationResult = { ...evaluationResult };  // Copia del estado actual

      if (question.type === 'multi') {
          if (selected === question.valid_answer) {
              newEvaluationResult[question.id] = { correct: true, color: 'green' };
              setSnackbarMessage('Respuesta correcta!');
          } else {
              newEvaluationResult[question.id] = { correct: false, color: 'red' };
              setSnackbarMessage('Respuesta incorrecta. Inténtalo de nuevo.');
          }
      } else if (question.type === 'open') {
          try {
              const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      questionId: question.id,
                      context: question.context,
                      response: selected
                  })
              });

              if (response.ok) {
                  const data = await response.json();
                  const resultColor = data.score > 50 ? 'green' : 'red';
                  newEvaluationResult[question.id] = { correct: data.score > 50, color: resultColor };
                  setSnackbarMessage(`Respuesta ${resultColor === 'green' ? 'correcta' : 'incorrecta'}. Puntuación: ${data.score}`);
              } else {
                  setSnackbarMessage('Error al validar la respuesta.');
              }
          } catch (error) {
              console.error('Error en la petición al backend:', error);
              setSnackbarMessage('Error en la comunicación con el servidor.');
          }
      }

      setEvaluationResult(newEvaluationResult);  // Actualiza el estado con la copia modificada
      setOpenSnackbar(true);
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
     <Box sx={{ position: 'fixed', top: 16, right: 20 }}>
       <Fab
         color="primary"
         onClick={() => navigate('/')}
         sx={{
           backgroundColor: orangeColor, // Asumimos que orangeColor está definido correctamente
           color: darkGrayColor,  // Asumimos que darkGrayColor también está definido
           '&:hover': {
             backgroundColor: deepOrange[700]  // Asegúrate de que este color está disponible en tu tema
           }
         }}
       >
         <LogoutIcon />
       </Fab>
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
                sx={getButtonStyle(questionnaire.status)} // Aplica estilos refinados
                startIcon={renderIcon(questionnaire.status)} // Icono para cada estado
                style={{ justifyContent: 'flex-start' }} // Justifica el icono a la izquierda
              >
                {questionnaire.name}
              </Button>
            </ListItem>
          ))}
        </List>

        {/* Add new questionnaire button */}
        <Box sx={{
            p: 2,
            position: 'fixed',
            bottom: 20,
            right: 20,
            pointerEvents: 'none'
        }}>
          <Fab
            sx={{
              backgroundColor: orangeColor,
              color: darkGrayColor,
              pointerEvents: 'auto'
            }}
            aria-label="add"
            onClick={() => navigate('/create-questionnaire')}
          >
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
                 <IconButton
                   onClick={(event) => handleOpenRatingMenu(event, question)}
                   sx={{ color: ratingSubmitted[question.id] ? orangeColor : 'default' }}  // Utiliza el ID de la pregunta para verificar si ha sido valorada
                 >
                   <RateReviewIcon />
                 </IconButton>
                  <Menu
                    anchorEl={ratingMenuAnchorEl}
                    open={Boolean(ratingMenuAnchorEl)}
                    onClose={handleCloseRatingMenu}
                    PaperProps={{
                      style: {
                        padding: '20px',
                        width: '300px'
                      }
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Valorar Pregunta
                    </Typography>
                    <Typography component="div" gutterBottom>
                      Redacción:
                      <Slider
                        value={rating.writing || 2}
                        onChange={(event, newValue) => setRating({...rating, writing: newValue})}
                        aria-labelledby="writing-slider"
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={1}
                        max={3}
                        sx={{
                            color: orangeColor, // Utiliza el color anaranjado de tu tema
                          }}
                      />
                    </Typography>
                    <Typography component="div" gutterBottom>
                      Dificultad:
                      <Slider
                        value={rating.difficulty || 2}
                        onChange={(event, newValue) => setRating({...rating, difficulty: newValue})}
                        aria-labelledby="difficulty-slider"
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={1}
                        max={3}
                        sx={{
                            color: orangeColor, // Utiliza el color anaranjado de tu tema
                          }}
                      />
                    </Typography>
                    <Typography component="div" gutterBottom>
                      Relevancia:
                      <Slider
                        value={rating.relevance ||2}
                        onChange={(event, newValue) => setRating({...rating, relevance: newValue})}
                        aria-labelledby="relevance-slider"
                        valueLabelDisplay="auto"
                        step={1}
                        marks
                        min={1}
                        max={3}
                        sx={{
                            color: orangeColor, // Utiliza el color anaranjado de tu tema
                          }}
                      />
                    </Typography>
                    <TextField
                      fullWidth
                      label="Comentarios adicionales"
                      variant="outlined"
                      multiline
                      rows={3}
                      value={textRating}
                      onChange={(e) => setTextRating(e.target.value)}
                      sx={{ mt: 2 }}
                    />
                    <IconButton
                      onClick={handleRatingSubmit}
                      sx={{
                        color: 'primary',
                        backgroundColor: orangeColor, // Asume que orangeColor es el color de tus otros botones
                        '&:hover': {
                          backgroundColor: '#e6b28e', // Un color más claro en hover
                        },
                        mt: 2
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Menu>
                </Box>
              </Box>
            ))}
            {/* Icono para exportar a PDF, colocado a la derecha */}
              <Box id="iconsContainer" sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%', mt: 2 }}>
                <IconButton
                  onClick={handleSubmitResults}
                  disabled={!allValidated}
                  sx={{
                    color: allValidated ? orangeColor : grey[500],
                    '&:hover': {
                      backgroundColor: allValidated ? '#e6b28e' : 'inherit'
                    },
                    ml: 2
                  }}
                >
                  <PublishedWithChangesIcon fontSize="normal" />
                </IconButton>
                  <IconButton onClick={exportPDF} sx={{ backgroundColor: orangeColor, color: '#fff', '&:hover': { backgroundColor: '#e6b28e' }, ml: 2 }}>
                    <PictureAsPdfIcon />
                  </IconButton>
                  <IconButton onClick={exportToMoodleXML} sx={{ backgroundColor: orangeColor, color: '#fff', ml: 1, '&:hover': { backgroundColor: '#e6b28e' }, ml:2 }}>
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
