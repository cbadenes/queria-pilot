// src/components/AboutButton.js
import React from 'react';
import { Dialog, DialogContent, IconButton, Typography, Box, Link, Fab, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

const orangeColor = '#FFD5B4';
const darkGrayColor = '#333333';

const AboutModal = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '10px',
          p: 2
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent>
        <Typography variant="h4" sx={{ mb: 4, color: darkGrayColor, fontWeight: 'bold' }}>
          Acerca de QuerIA
        </Typography>

        <Typography paragraph sx={{ mb: 4, color: darkGrayColor, textAlign: 'justify' }}>
          QuerIA es una iniciativa desarrollada por investigadores y docentes de la Universidad Politécnica de Madrid (UPM). Nuestro objetivo es transformar la evaluación educativa mediante tecnologías de Inteligencia Artificial (IA), generando cuestionarios personalizados que se adaptan a las necesidades de cada estudiante.
        </Typography>

        <Typography paragraph sx={{ textAlign: 'justify' }}>
          Priorizando la privacidad y seguridad, todo el procesamiento se realiza en servidores locales mediante modelos de IA desarrollados específicamente para este propósito. El sistema es capaz de procesar documentos en español, inglés, francés, alemán, italiano y portugués, aunque los cuestionarios generados se proporcionan en español para garantizar la coherencia pedagógica.
        </Typography>

        <Typography variant="h5" sx={{ mt: 4, mb: 2, color: darkGrayColor, fontWeight: 'bold' }}>
          Publicaciones
        </Typography>

        <Typography paragraph sx={{ pl: 3, borderLeft: '3px solid #FFD5B4', textAlign: 'justify' }}>
          Badenes-Olmedo, C., Eyzaguirre, P., & Martín-Nuñez, L. (2024). <Link href="https://repositorio.uam.es/bitstream/handle/10486/715973/IDUM_2.pdf?sequence=1&isAllowed=y" target="_blank" rel="noopener noreferrer">QuerIA: Automatización y Personalización de Cuestionarios</Link>. En I Congreso en Innovación Docente de las Universidades Madrileñas: MadrID (pp. 16-26). Universidad Autónoma de Madrid.
        </Typography>

        <Typography paragraph sx={{ pl: 3, borderLeft: '3px solid #FFD5B4', textAlign: 'justify' }}>
          Eyzaguirre, P., & Badenes-Olmedo, C. (2024). <Link href="https://short.upm.es/p1eky" target="_blank" rel="noopener noreferrer">QuerIA: Contextual Learning-Driven Questionnaire Generation and Assessment based on Large Language Models</Link>. In Proceedings of the 24th International Conference on Knowledge Engineering and Knowledge Management (EKAW 2024). Springer Nature Switzerland.
        </Typography>

        <Typography variant="h5" sx={{ mt: 4, mb: 2, color: darkGrayColor, fontWeight: 'bold' }}>
          Premios y Reconocimientos
        </Typography>

        <Typography paragraph sx={{ pl: 3, borderLeft: '3px solid #FFD5B4', textAlign: 'justify' }}>
          🏆 <strong>Premio a la Innovación Educativa ETSISI 2024</strong>
          <br />
          Reconocimiento en la categoría de Aprendizaje Potenciado mediante Inteligencia Artificial por el trabajo <Link href="https://oa.upm.es/84120/2/ACTAS.pdf" target="_blank" rel="noopener noreferrer">"QuerIA: Sistema de Aprendizaje Personalizado mediante Cuestionarios Inteligentes"</Link>.
        </Typography>

        <Typography paragraph sx={{ pl: 3, borderLeft: '3px solid #FFD5B4', textAlign: 'justify' }}>
          🎯 <strong>Finalista EKAW 2024 Best Demo Award</strong>
          <br />
          Seleccionado entre los 4 mejores <Link href="https://event.cwi.nl/ekaw2024/accepted-posters-demos.html" target="_blank" rel="noopener noreferrer">demo-paper</Link> en el 24th International Conference on Knowledge Engineering and Knowledge Management (EKAW).
        </Typography>

        <Typography variant="h5" sx={{ mt: 4, mb: 2, color: darkGrayColor, fontWeight: 'bold' }}>
          Contacto
        </Typography>

        <Typography>
          📧 <Link href="mailto:carlos.badenes@upm.es" target="_blank" rel="noopener noreferrer">carlos.badenes@upm.es</Link>
        </Typography>
        <Typography>
          📞 +34 910 67 35 20
        </Typography>
        <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
          Escuela Técnica Superior de Ingeniería de Sistemas Informáticos
          <br />
          Universidad Politécnica de Madrid
          <br />
          Campus Sur
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

const AboutButton = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Box sx={{
        position: 'fixed',
        top: 60,
        right: 90,
        zIndex: 1000
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