import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StyledDropzone from './StyledDropzone';
import { AppBar, Toolbar, Typography, Button, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Grid, Snackbar, TextField, MenuItem } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MuiAlert from '@mui/material/Alert';
import API_BASE_URL from './config';  // Importar la URL base desde config.js
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


const drawerWidth = 240;

// Snackbar de éxito personalizado
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);  // Estado para manejar el archivo PDF
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('Medium');
  const [percentageFreeResponse, setPercentageFreeResponse] = useState(50);
  const [openSnackbar, setOpenSnackbar] = useState(false);  // Estado para el Snackbar
  const [cuestionarios, setCuestionarios] = useState([]);

  useEffect(() => {
          fetchCuestionarios();
  }, []);

  const fetchCuestionarios = async () => {
          try {
              const response = await fetch(`${API_BASE_URL}/api/cuestionarios`);
              if (!response.ok) throw new Error('Network response was not ok.');
              const data = await response.json();
              setCuestionarios(data.cuestionarios);  // Asumiendo que el backend devuelve un objeto con una propiedad cuestionarios
          } catch (error) {
              console.error('Failed to fetch cuestionarios:', error);
          }
  };

  const handleLogout = () => {
    navigate('/');
  };

  // Manejar la solicitud de generación del cuestionario
  const handleGenerate = async () => {
    if (!file) {
      alert('Please upload a PDF file');
      return;
    }

    const formData = new FormData();
    console.log(file);
    formData.append('pdf', file);  // Enviar el archivo PDF
    formData.append('numQuestions', numQuestions);
    formData.append('difficulty', difficulty);
    formData.append('percentageFreeResponse', percentageFreeResponse);

    try {
      const response = await fetch(`${API_BASE_URL}/api/createQuestionnaire`, {  // Usar la URL base configurada
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Questions received:', data);  // Verifica la respuesta del backend
        setOpenSnackbar(true);

        // Resetear los valores del formulario y el archivo
        setFile(null);
        setNumQuestions(10);
        setDifficulty('Medium');
        setPercentageFreeResponse(50);

      } else {
        const errorData = await response.json();  // Verifica la respuesta de error
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to generate questionnaire');
      }
    } catch (error) {
      console.error('Error generating questionnaire:', error);  // Depurar errores
      alert('There was an error generating the questionnaire.');
    }
  };

  // Cerrar el Snackbar después de mostrarlo
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
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
              {cuestionarios.map((cuestionario, index) => (
                  <ListItem button="true" key={index}>
                      <ListItemIcon>
                          {cuestionario.estado === 'en_construccion' ? <BuildIcon /> : <CheckCircleIcon />}
                      </ListItemIcon>
                      <ListItemText primary={cuestionario.nombre} />
                  </ListItem>
              ))}
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
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGenerate}
              disabled={!file}  // Deshabilitar hasta que se cargue un PDF
            >
              Generate Questionnaire
            </Button>
          </Grid>
        </Grid>
        {/* Snackbar de éxito */}
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success">
            Questionnaire generation requested successfully!
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Dashboard;
