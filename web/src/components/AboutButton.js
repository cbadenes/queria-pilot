// src/components/AboutButton.js
import React from 'react';
import { Dialog, DialogContent, IconButton, Typography, Box, Link, Fab, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

const orangeColor = '#FFD5B4';
const darkGrayColor = '#333333';

const AboutModal = ({ open, onClose }) => {
  // ... mantener el resto del modal igual ...
};

const AboutButton = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Box sx={{
        position: 'fixed',
        top: 60,  // Ajustado para tener en cuenta el banner
        right: 90,
        zIndex: 1000  // Asegurarse de que esté por debajo del banner
      }}>
        <Tooltip title="Sobre QuerIA" arrow placement="left">
          <Fab
            onClick={() => setOpen(true)}
            sx={{
              backgroundColor: orangeColor,
              color: darkGrayColor,
              '&:hover': {
                backgroundColor: '#e6b28e'
              }
            }}
          >
            <InfoIcon />
          </Fab>
        </Tooltip>
      </Box>
      <AboutModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default AboutButton;