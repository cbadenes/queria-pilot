import React from 'react';
import {
  Typography,
  TextField,
  Box,
  Paper,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Divider
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SchoolIcon from '@mui/icons-material/School';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const QuestionRatingForm = ({ rating, setRating, textRating, setTextRating, orangeColor = '#FFD5B4', onClose, questionType }) => {
  const handleRatingChange = (paramId) => (event, newValue) => {
    if (newValue !== null) {
      setRating(prev => ({
        ...prev,
        [paramId]: newValue
      }));
    }
  };

  const allCriteriaRated = () => {
    const requiredFields = ['clarity', 'complexity', 'alignment', 'quality', 'pedagogical', 'cognitive'];
    return requiredFields.every(field => rating[field] !== undefined);
  };

  const BinaryCriterion = ({ id, label, description }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          {description}
        </Typography>
      </Box>
      <ToggleButtonGroup
        value={rating[id] || null}
        exclusive
        onChange={handleRatingChange(id)}
        fullWidth
        size="small"
      >
        <ToggleButton
          value={1}
          sx={{
            py: 0.5,
            '&.Mui-selected': {
              backgroundColor: '#ffcdd2',
              '&:hover': { backgroundColor: '#ef9a9a' }
            }
          }}
        >
          <ThumbDownIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
          <Typography variant="caption">No Adecuado</Typography>
        </ToggleButton>
        <ToggleButton
          value={3}
          sx={{
            py: 0.5,
            '&.Mui-selected': {
              backgroundColor: '#c8e6c9',
              '&:hover': { backgroundColor: '#a5d6a7' }
            }
          }}
        >
          <ThumbUpIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
          <Typography variant="caption">Adecuado</Typography>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );

  const CognitiveCriterion = () => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          Nivel Cognitivo
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          ¿Qué tipo de pensamiento requiere la pregunta?
        </Typography>
      </Box>
      <ToggleButtonGroup
        value={rating.cognitive || null}
        exclusive
        onChange={handleRatingChange('cognitive')}
        fullWidth
        size="small"
      >
        <ToggleButton
          value={1}
          sx={{
            py: 0.5,
            '&.Mui-selected': {
              backgroundColor: '#e3f2fd',
              '&:hover': { backgroundColor: '#bbdefb' }
            }
          }}
        >
          <AutoStoriesIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
          <Typography variant="caption">Memorización</Typography>
        </ToggleButton>
        <ToggleButton
          value={2}
          sx={{
            py: 0.5,
            '&.Mui-selected': {
              backgroundColor: '#e8eaf6',
              '&:hover': { backgroundColor: '#c5cae9' }
            }
          }}
        >
          <PsychologyIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
          <Typography variant="caption">Comprensión</Typography>
        </ToggleButton>
        <ToggleButton
          value={3}
          sx={{
            py: 0.5,
            '&.Mui-selected': {
              backgroundColor: '#fff3e0',
              '&:hover': { backgroundColor: '#ffe0b2' }
            }
          }}
        >
          <SchoolIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
          <Typography variant="caption">Análisis</Typography>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );

  return (
    <Paper elevation={0} sx={{ width: '500px', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Evalúa la Pregunta
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Valora cada aspecto seleccionando una opción.
        </Typography>
      </Box>

      <Box sx={{ maxHeight: '60vh', overflow: 'auto', pr: 2 }}>
        <BinaryCriterion
          id="clarity"
          label="Claridad"
          description="¿La pregunta es clara y comprensible?"
        />
        <BinaryCriterion
          id="complexity"
          label="Complejidad"
          description="¿El nivel de dificultad es adecuado?"
        />
        <BinaryCriterion
          id="alignment"
          label="Alineación"
          description="¿Se relaciona bien con el material?"
        />
        <BinaryCriterion
          id="quality"
          label="Calidad"
          description={questionType === 'multi' ?
            "¿Las opciones de respuesta son adecuadas?" :
            "¿La respuesta sugerida es adecuada?"}
        />
        <BinaryCriterion
          id="pedagogical"
          label="Valor Pedagógico"
          description="¿Es útil para el aprendizaje?"
        />

        <CognitiveCriterion />

        <Divider sx={{ my: 3 }} />

        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          label="Comentarios Adicionales (Opcional)"
          value={textRating}
          onChange={(e) => setTextRating(e.target.value)}
          placeholder="Añade cualquier observación o sugerencia..."
          size="small"
        />
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          onClick={onClose}
          disabled={!allCriteriaRated()}
          endIcon={<CheckCircleIcon />}
          sx={{
            backgroundColor: allCriteriaRated() ? orangeColor : 'transparent',
            color: allCriteriaRated() ? '#333333' : '#bdbdbd',
            '&:hover': {
              backgroundColor: allCriteriaRated() ? '#e6b28e' : 'transparent',
            }
          }}
        >
          Guardar Evaluación
        </Button>
      </Box>
    </Paper>
  );
};

export default QuestionRatingForm;