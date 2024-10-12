import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const defaultPrompts = [
  "What is the XRPL?",
  "What is this page about?",
  "What is Ripple?"
];

const DefaultPrompts = ({ onPromptClick }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Try asking:
      </Typography>
      {defaultPrompts.map((prompt, index) => (
        <Button
          key={index}
          variant="outlined"
          size="small"
          onClick={() => onPromptClick(prompt)}
          sx={{ mr: 1, mb: 1 }}
        >
          {prompt}
        </Button>
      ))}
    </Box>
  );
};

export default DefaultPrompts;