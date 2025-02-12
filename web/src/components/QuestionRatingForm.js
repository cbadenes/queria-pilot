import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Box,
  Paper,
  Button,
  MobileStepper,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const QuestionRatingForm = ({ rating, setRating, textRating, setTextRating, orangeColor = '#FFD5B4', onClose, questionType }) => {
  const [activeStep, setActiveStep] = useState(0);

  const ratingParams = [
    {
      id: 'clarity',
      label: 'Claridad',
      description: 'Evalúa como de clara y comprensible es la pregunta',
      options: [
        { value: 1, label: 'Confusa' },
        { value: 2, label: 'Comprensible' },
        { value: 3, label: 'Precisa' }
      ]
    },
    {
      id: 'complexity',
      label: 'Complejidad',
      description: 'Valora si el nivel de dificultad es adecuado',
      options: [
        { value: 1, label: 'Básica' },
        { value: 2, label: 'Apropiada' },
        { value: 3, label: 'Compleja' }
      ]
    },
    {
      id: 'alignment',
      label: 'Alineación',
      description: 'Indica cómo de bien se relaciona la pregunta con el material',
      options: [
        { value: 1, label: 'Poco' },
        { value: 2, label: 'Bastante' },
        { value: 3, label: 'Mucho' }
      ]
    },
    {
      id: 'quality',
      label: 'Calidad',
      description: questionType === 'multi'
        ? 'Evalúa la calidad y pertinencia de las opciones de respuesta'
        : 'Evalúa cómo de adecuada ha sido la respuesta sugerida por el sistema',
      options: questionType === 'multi'
        ? [
            { value: 1, label: 'Mejorable' },
            { value: 2, label: 'Aceptable' },
            { value: 3, label: 'Excelente' }
          ]
        : [
            { value: 1, label: 'Inadecuada' },
            { value: 2, label: 'Aceptable' },
            { value: 3, label: 'Precisa' }
          ]
    },
    {
      id: 'pedagogical',
      label: 'Valor Pedagógico',
      description: 'Valora la utilidad de la pregunta para el aprendizaje',
      options: [
        { value: 1, label: 'Limitado' },
        { value: 2, label: 'Adecuado' },
        { value: 3, label: 'Excepcional' }
      ]
    },
    {
      id: 'cognitive',
      label: 'Nivel Cognitivo',
      description: 'Evalúa el nivel de pensamiento requerido',
      options: [
        { value: 1, label: 'Memoria' },
        { value: 2, label: 'Comprensión' },
        { value: 3, label: 'Análisis' }
      ]
    },
    {
      id: 'contextual',
      label: 'Contexto',
      description: 'Valora si la pregunta proporciona suficiente contexto',
      options: [
        { value: 1, label: 'Insuficiente' },
        { value: 2, label: 'Suficiente' },
        { value: 3, label: 'Excelente' }
      ]
    },
    {
      id: 'originality',
      label: 'Originalidad',
      description: 'Evalúa cómo de única y creativa es la pregunta',
      options: [
        { value: 1, label: 'Común' },
        { value: 2, label: 'Interesante' },
        { value: 3, label: 'Innovadora' }
      ]
    }
  ];

  const handleRatingChange = (paramId) => (event, newValue) => {
    if (newValue !== null) {
      setRating(prev => ({
        ...prev,
        [paramId]: newValue
      }));
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const isStepComplete = (step) => {
    if (step < ratingParams.length) {
      return rating[ratingParams[step].id] !== undefined;
    }
    return true; // El paso de comentarios es opcional
  };

  const canAdvance = isStepComplete(activeStep);

  return (
    <Paper elevation={0} sx={{ width: '500px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, flex: 1 }}>
        <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
          {activeStep === ratingParams.length ? 'Comentarios Adicionales' : `${activeStep + 1}. ${ratingParams[activeStep].label}`}
        </Typography>

        {activeStep === ratingParams.length ? (
          <Box sx={{ height: '250px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              ¿Algún comentario adicional? (Opcional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              value={textRating}
              onChange={(e) => setTextRating(e.target.value)}
              placeholder="Añade cualquier observación o sugerencia para mejorar esta pregunta..."
            />
          </Box>
        ) : (
          <Box sx={{ height: '250px' }}>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 4,
                textAlign: 'center',
                color: '#666',
                px: 2
              }}
            >
              {ratingParams[activeStep].description}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ToggleButtonGroup
                value={rating[ratingParams[activeStep].id] || null}
                exclusive
                onChange={handleRatingChange(ratingParams[activeStep].id)}
                sx={{ mb: 2 }}
              >
                {ratingParams[activeStep].options.map((option) => (
                  <ToggleButton
                    key={option.value}
                    value={option.value}
                    sx={{
                      px: 3,
                      py: 1,
                      '&.Mui-selected': {
                        backgroundColor: `${orangeColor} !important`,
                        color: '#333333'
                      }
                    }}
                  >
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>
        )}

        <MobileStepper
          variant="progress"
          steps={ratingParams.length + 1}
          position="static"
          activeStep={activeStep}
          sx={{
            maxWidth: '100%',
            flexGrow: 1,
            '& .MuiLinearProgress-bar': {
              backgroundColor: orangeColor
            }
          }}
          nextButton={
            <Button
              size="small"
              onClick={activeStep === ratingParams.length ? onClose : handleNext}
              disabled={!canAdvance}
              endIcon={activeStep === ratingParams.length ? <CheckCircleIcon /> : <NavigateNextIcon />}
              sx={{
                backgroundColor: canAdvance ? orangeColor : 'transparent',
                color: canAdvance ? '#333333' : '#bdbdbd',
                '&:hover': {
                  backgroundColor: canAdvance ? '#e6b28e' : 'transparent',
                }
              }}
            >
              {activeStep === ratingParams.length ? 'Finalizar' : 'Siguiente'}
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<NavigateBeforeIcon />}
            >
              Anterior
            </Button>
          }
        />
      </Box>
    </Paper>
  );
};

export default QuestionRatingForm;