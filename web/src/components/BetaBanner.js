// src/components/BetaVersionBanner.js
import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const orangeColor = '#FFD5B4';
const darkGrayColor = '#333333';

const BetaBanner = () => {
  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 240,  // Ajustado para tener en cuenta el drawer
      right: 0,
      zIndex: 1100,
    }}>
      <Box sx={{
        bgcolor: orangeColor,
        p: 1,
        textAlign: 'center',
      }}>
        <Typography
          variant="caption"
          sx={{
            color: darkGrayColor,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          Versión Piloto •
          <Link
            href="mailto:carlos.badenes@upm.es"
            sx={{
              color: darkGrayColor,
              textDecoration: 'underline',
              '&:hover': {
                color: '#000000'
              }
            }}
          >
            ¿Tienes algún comentario o sugerencia?
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default BetaBanner;