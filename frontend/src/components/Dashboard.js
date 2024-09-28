import React, { useState, useEffect } from 'react';
import MuiAlert from '@mui/material/Alert';  // Componente para mostrar alertas
import { CssBaseline, Drawer, List, ListItem, Box, Snackbar, Menu, MenuItem, TextFields, Fab, IconButton, Typography, Button, Divider } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
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
  const [selectedAnswer, setSelectedAnswer] = useState({});  // Almacena las respuestas seleccionadas por el usuario
  const [openSnackbar, setOpenSnackbar] = useState(false);  // Estado para controlar el Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState('');  // Almacena el mensaje a mostrar en el Snackbar
  const [anchorEl, setAnchorEl] = useState(null);
  const [comment, setComment] = useState('');
  const [likeDislike, setLikeDislike] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);  // Estado para la pregunta actual



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
      } else {
        console.error('Failed to fetch questionnaire details:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching questionnaire details:', error);
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

  const handleValidate = async (question) => {
      console.log("Validating question:", question); // Verificar que la función se llama
      const response = selectedAnswer[question.id] || "";  // Obtiene la respuesta guardada en el estado
      console.log("Selected response:", response); // Ver qué respuesta se seleccionó
      const newResponse = {
        date: new Date().toISOString().split('T')[0],  // Fecha actual en formato 'YYYY-MM-DD'
        response: response,
        score: null,  // Aquí puedes incluir la lógica para calcular el puntaje si es necesario
        feedback: ""  // Aquí puedes incluir la lógica para generar feedback automático si es necesario
      };

      // Agrega la nueva respuesta a las existentes
      question.responses.push(newResponse);

      // POST al backend
      try {
        const result = await fetch(`${API_BASE_URL}/api/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({question: question})  // Envía la pregunta como parte del cuerpo de la solicitud
        });
        const data = await result.json();
        setOpenSnackbar(true);  // Abre el Snackbar cuando la respuesta es recibida
        console.log("Mensaje del servidor:", data.message);
      } catch (error) {
        console.error("Error en la petición al backend:", error);
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
          <Box sx={{ p: 4, width: '80%', textAlign: 'left', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
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
                    onChange={(e) => setSelectedAnswer({ ...selectedAnswer, [question.id]: e.target.value })}
                  />
                ) : (
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend">Elige una respuesta</FormLabel>
                    <RadioGroup
                      onChange={(e) => setSelectedAnswer({ ...selectedAnswer, [question.id]: e.target.value })}
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
                    disabled={!selectedAnswer[question.id]}
                    sx={{
                      color: selectedAnswer[question.id] ? green[500] : grey[400]
                    }}
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
