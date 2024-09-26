import React, { useState, useEffect } from 'react';
import { CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Fab, IconButton, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';  // Base URL for API requests
import logo from '../assets/images/queria-logo.png';  // Logo

const orangeColor = '#FFD5B4';  // Button color
const darkGrayColor = '#333333';  // Text color

const Dashboard = () => {
  const navigate = useNavigate();
  const [questionnaires, setQuestionnaires] = useState([]);

  // Fetch questionnaires from the backend
  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/questionnaires`);
        if (response.ok) {
          const data = await response.json();
          setQuestionnaires(data.questionnaires);  // Assuming the backend sends {questionnaires: [...] }
        } else {
          console.error('Failed to fetch questionnaires:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching questionnaires:', error);
      }
    };

    fetchQuestionnaires();
  }, []);

  // Logout handler
  const handleLogout = () => {
    navigate('/');
  };

  // Navigate to create new questionnaire
  const handleCreateNew = () => {
    navigate('/create-questionnaire');
  };

  // Function to render an icon based on the questionnaire's status
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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Logout icon at the top-right corner */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <IconButton color="inherit" onClick={handleLogout} sx={{ color: darkGrayColor }}>
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
            backgroundColor: '#f0f0f0',  // Light gray background
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* Sidebar header */}
        <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #ddd' }}>
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
            <ListItem button key={index}>
              <ListItemIcon>{renderIcon(questionnaire.status)}</ListItemIcon>
              <ListItemText primary={questionnaire.name} />
            </ListItem>
          ))}
        </List>

        {/* Add new questionnaire button */}
        <Box sx={{ p: 2, position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
          <Fab sx={{ backgroundColor: orangeColor, color: darkGrayColor }} aria-label="add" onClick={handleCreateNew}>
            <AddIcon />
          </Fab>
        </Box>
      </Drawer>

      {/* Main Content */}
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
        }}
      >
        <img src={logo} alt="Logo QuerIA" style={{ maxWidth: '300px', marginBottom: '20px' }} />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: darkGrayColor,
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          QuerIA
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#666', fontFamily: '"Poppins", sans-serif' }}>
          Grupo de Innovación Educativa
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
