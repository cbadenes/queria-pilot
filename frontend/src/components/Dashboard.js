import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StyledDropzone from './StyledDropzone';
import { AppBar, Toolbar, Typography, Button, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, TextField, MenuItem, Grid } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const drawerWidth = 240;

const Dashboard = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);  // Estado para manejar el archivo PDF
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('Medium');
  const [percentageFreeResponse, setPercentageFreeResponse] = useState(50);

  const handleLogout = () => {
    navigate('/');
  };

  const handleGenerate = async () => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('numQuestions', numQuestions);
    formData.append('difficulty', difficulty);
    formData.append('percentageFreeResponse', percentageFreeResponse);

    try {
      const response = await fetch('http://localhost:3000/generate-questions', {
        method: 'POST',
        body: formData, // Envía el formulario con el archivo y datos
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Questions received:', data.questions);
        // Aquí puedes actualizar el estado para mostrar las preguntas en el UI
      } else {
        throw new Error('Failed to generate questions');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            QuerIA
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <List>
          <ListItem button>
            <ListItemIcon><CloudUploadIcon /></ListItemIcon>
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <StyledDropzone setFile={setFile} />
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Number of Questions"
              value={numQuestions}
              onChange={e => setNumQuestions(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Difficulty"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              variant="outlined"
            >
              {['Easy', 'Medium', 'Hard'].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Percentage of Free Response"
              value={percentageFreeResponse}
              onChange={e => setPercentageFreeResponse(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" fullWidth onClick={handleGenerate}>
              Generate Questionnaire
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
