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
          Quienes Somos
        </Typography>

        <Typography paragraph>
          QuerIA nace como una iniciativa innovadora en la Universidad Politécnica de Madrid (UPM) que busca transformar la forma en que se crean y evalúan los cuestionarios educativos. Utilizando tecnologías de Inteligencia Artificial, nuestro sistema permite generar preguntas personalizadas y adaptativas que se ajustan a las necesidades individuales de cada estudiante.
        </Typography>

        <Typography variant="h5" sx={{ mt: 4, mb: 2, color: darkGrayColor, fontWeight: 'bold' }}>
          El Equipo QuerIA
        </Typography>

        <Typography paragraph>
          El desarrollo principal de QuerIA ha sido llevado a cabo con la colaboración de investigadores y docentes del <Link href="https://innovacioneducativa.upm.es/grupos-de-innovacion-educativa/grupo-tecnologias-educativas-y-metodos-activos-de-aprendizaje" target="_blank" rel="noopener noreferrer">Grupo de Innovación Educativa GIETEMA</Link> de la UPM. El proyecto se enmarca dentro del <Link href="https://innovacioneducativa.upm.es/proyectos-ie/informacion?anyo=2023-2024&id=1196" target="_blank" rel="noopener noreferrer">Proyecto de Innovación Educativa IE24.6109</Link>, donde profesores e investigadores aportan su experiencia en innovación docente y evaluación educativa.
        </Typography>

        <Typography variant="h5" sx={{ mt: 4, mb: 2, color: darkGrayColor, fontWeight: 'bold' }}>
          Publicaciones
        </Typography>

        <Typography paragraph sx={{ pl: 3, borderLeft: '3px solid #FFD5B4' }}>
          Eyzaguirre, P., & Badenes-Olmedo, C. (2024). QuerIA: Contextual Learning-Driven Questionnaire Generation and Assessment based on Large Language Models. In Proceedings of the 24th International Conference on Knowledge Engineering and Knowledge Management (EKAW 2024). Springer Nature Switzerland.
        </Typography>

        <Typography paragraph sx={{ pl: 3, borderLeft: '3px solid #FFD5B4' }}>
          Eyzaguirre, P., Badenes-Olmedo, C., & Martín-Nuñez, L. (2024). QuerIA: Automatización y Personalización de Cuestionarios. En I Congreso en Innovación Docente de las Universidades Madrileñas: MadrID (pp. 16-26). Universidad Autónoma de Madrid.
        </Typography>

        <Typography variant="h5" sx={{ mt: 4, mb: 2, color: darkGrayColor, fontWeight: 'bold' }}>
          Contacto
        </Typography>

        <Typography>
          📧 carlos.badenes@upm.es
        </Typography>
        <Typography>
          📞 +34 910 67 35 20
        </Typography>
        <Typography sx={{ mt: 2 }}>
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
      <Box sx={{ position: 'fixed', top: 16, right: 90 }}>
        <Tooltip title="Sobre nosotros" arrow placement="left">
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