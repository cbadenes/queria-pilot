import React, { useState } from 'react';
import { TextField, Typography, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const EditableTitle = ({ initialValue, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [tempValue, setTempValue] = useState(initialValue);

  const handleEdit = () => {
    setTempValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (tempValue.trim() !== '') {
      setValue(tempValue);
      onSave(tempValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyPress}
          variant="standard"
          autoFocus
          size="small"
          sx={{ minWidth: '200px' }}
        />
        <IconButton size="small" onClick={handleSave} color="primary">
          <CheckIcon />
        </IconButton>
        <IconButton size="small" onClick={handleCancel} color="error">
          <CloseIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body1">
        {value}
      </Typography>
      <IconButton size="small" onClick={handleEdit}>
        <EditIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default EditableTitle;