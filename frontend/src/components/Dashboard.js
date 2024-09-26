import React, { useState, useEffect } from 'react';
import { CssBaseline, Drawer, List, ListItem, Box, Fab, IconButton, Typography, Button, Divider } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';  // Base URL for API requests
import logo from '../assets/images/queria-logo.png';  // Logo

const orangeColor = '#FFD5B4';  // Color for the "Create" button
const darkGrayColor = '#333333';  // Color for the text
const lightBackground = '#fafafa';  // Lighter background for the questionnaire list

const Dashboard = () => {
  const navigate = useNavigate();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);  // Store the list of questions for the selected questionnaire

  // Fetch questionnaires from the backend
  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/questionnaires`);
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
    <Box sx={{ display: 'flex' }}>
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
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Type:</strong> {question.type}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Available Answers:</strong> {question.available_answers.join(', ')}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Valid Answer:</strong> {question.valid_answer || 'N/A'}
                </Typography>
                <Divider sx={{ mt: 2, mb: 2 }} />
              </Box>
            ))}
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
