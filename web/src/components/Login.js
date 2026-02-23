import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  CssBaseline,
  Divider,
  Link,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import logo from '../assets/images/queria-logo.png';
import API_BASE_URL from './config';
import Footer from './Footer';
import EmailIcon from '@mui/icons-material/Email';

const orangeColor = '#FFD5B4';
const darkGrayColor = '#333333';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
      e.preventDefault();
      setErrorMessage(''); // Limpiar mensaje de error previo
      const loginData = { email, password };

      try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('userToken', data.access_token);
          localStorage.setItem('userEmail', email);
          navigate('/dashboard');
        } else {
          // Mostrar el mensaje de error que viene del backend
          setErrorMessage(data.message || 'Error al iniciar sesión');
        }
      } catch (error) {
        setErrorMessage('Error de conexión. Por favor, inténtelo de nuevo más tarde.');
      }
    };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:carlos.badenes@upm.es?subject=Solicitud de Alta en QuerIA&body=Hola,%0A%0AMe gustaría solicitar acceso a la plataforma QuerIA.%0A%0AMi correo electrónico: ${encodeURIComponent(email || "[Tu correo electrónico]")}%0A%0AÁrea de conocimiento: [Indique su área de conocimiento]%0A%0APropósito: [Describa el propósito para el que utilizará la plataforma]%0A%0ADepartamento/Escuela: [Indique su departamento o escuela]%0A%0ASaludos.`;
    handleCloseDialog();
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img src={logo} alt="QuerIA Logo" style={{ maxWidth: '150px', marginBottom: '20px' }} />
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 'bold',
            color: darkGrayColor,
            mb: 3
          }}
        >
          QuerIA
        </Typography>
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            p: 4,
            borderRadius: '10px'
          }}
        >
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              variant="filled"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              InputProps={{
                style: { backgroundColor: '#E6B895' }
              }}
            />
            <TextField
              variant="filled"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              InputProps={{
                style: { backgroundColor: '#E6B895' }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: orangeColor,
                color: darkGrayColor,
                fontWeight: 'bold',
                fontFamily: '"Poppins", sans-serif',
                '&:hover': {
                  backgroundColor: '#e6b28e',
                }
              }}
            >
              Iniciar Sesión
            </Button>
            {errorMessage && (
              <Typography
                variant="body2"
                color="error"
                sx={{
                  mt: 2,
                  textAlign: 'center',
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 'bold',
                }}
              >
                {errorMessage}
              </Typography>
            )}

            <Divider sx={{ my: 3 }}>
              <Typography color="text.secondary" variant="body2">
                ¿No tienes cuenta?
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleOpenDialog}
                startIcon={<EmailIcon />}
                sx={{
                  color: darkGrayColor,
                  borderColor: orangeColor,
                  '&:hover': {
                    backgroundColor: '#ffe8d9',
                    borderColor: '#e6b28e',
                  }
                }}
              >
                Solicitar Acceso
              </Button>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mt: 1
                }}
              >
                Plataforma disponible para personal académico.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Diálogo para solicitar acceso */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              borderRadius: '10px'
            }
          }}
        >
          <DialogTitle sx={{
            backgroundColor: orangeColor,
            color: darkGrayColor,
            fontWeight: 'bold'
          }}>
            Solicitar Acceso a QuerIA
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <DialogContentText>
              Para solicitar acceso a la plataforma, envíe un correo electrónico a:
            </DialogContentText>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              my: 3,
              p: 2,
              backgroundColor: '#f5f5f5',
              borderRadius: '5px'
            }}>
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                onClick={handleEmailClick}
                sx={{
                  backgroundColor: orangeColor,
                  color: darkGrayColor,
                  '&:hover': {
                    backgroundColor: '#e6b28e',
                  }
                }}
              >
                carlos.badenes@upm.es
              </Button>
            </Box>
            <DialogContentText>
              Indique en el correo su nombre completo, departamento, área de conocimiento y el propósito de uso de la plataforma para poder perfilar mejor sus evaluaciones.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDialog}
              sx={{
                color: darkGrayColor
              }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
        <Footer />
      </Box>
    </Container>
  );
};

export default Login;