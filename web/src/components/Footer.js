// src/components/Footer.js
import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{
      bgcolor: 'background.paper',
      p: 3,
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      textAlign: 'center'
    }}>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} QuerIA
        {' | '}
        <Link color="inherit" href="https://innovacioneducativa.upm.es/proyectos-ie/informacion?anyo=2023-2024&id=1196">
          Proyecto de innovación educativa de la UPM IE24.6109
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
