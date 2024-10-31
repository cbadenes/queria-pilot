import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Container, CssBaseline } from '@mui/material';
import logo from '../assets/images/queria-logo.png';
import API_BASE_URL from './config';

const orangeColor = '#FFD5B4';
const darkGrayColor = '#333333';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');  // Nuevo estado para el mensaje de error
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginData = { email, password };
    console.log('Datos de login:', loginData);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userToken', data.access_token);
        localStorage.setItem('userEmail', email);
        navigate('/dashboard');
        setErrorMessage('');  // Limpia el mensaje de error si el login es exitoso
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Credenciales incorrectas');  // Actualiza el mensaje de error
      }
    } catch (error) {
      setErrorMessage('Error al intentar iniciar sesión. Por favor, inténtelo de nuevo.');
    }
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
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
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
          {errorMessage && (  // Mostrar el mensaje de error si existe
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
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
