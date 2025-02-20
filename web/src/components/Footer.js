// src/components/Footer.js
import React from 'react';
import { Box, Typography, Link, Tooltip } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

const Footer = () => {
  return (
    <Box sx={{
      bgcolor: 'background.paper',
      p: 2,
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      textAlign: 'center'
    }}>
      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        © {new Date().getFullYear()} QuerIA
        <Tooltip title="Enviar feedback" placement="top" arrow>
          <Link
            color="inherit"
            href="mailto:carlos.badenes@upm.es"
            sx={{
              display: 'flex',
              alignItems: 'center',
              opacity: 0.7,
              '&:hover': {
                color: '#FFD5B4',
                opacity: 1
              }
            }}
          >
            <EmailIcon sx={{ fontSize: 13 }} />
          </Link>
        </Tooltip>
      </Typography>
    </Box>
  );
};

export default Footer;