import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Container, CssBaseline } from '@mui/material';
import logo from '../assets/images/queria-logo.png';  // Asegúrate de que la ruta sea correcta
import API_BASE_URL from './config';  // Importar la URL base desde config.js

const orangeColor = '#FFD5B4';  // Color anaranjado
const darkGrayColor = '#333333';  // Color gris oscuro para el texto

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        localStorage.setItem('userEmail', email);  // Guardar el email del usuario en localStorage
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        alert('Login failed: ' + errorData.message);
      }
    } catch (error) {
      alert('Login failed: ' + error.message);
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
              style: { backgroundColor: '#E6B895' }  // Color ligeramente más oscuro
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
              style: { backgroundColor: '#E6B895' }  // Color ligeramente más oscuro
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
                backgroundColor: '#e6b28e',  // Un poco más oscuro al hacer hover
              }
            }}
          >
            Iniciar Sesión
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
