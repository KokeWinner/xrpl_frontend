import React from 'react';
import { Alert, Slide, Snackbar } from '@mui/material';

function TransitionLeft(props) {
  return <Slide {...props} direction="left" />;
}

export default function XSnackbar({ isOpen, close, message, variant }) {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    close();
  };

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={2000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={TransitionLeft}
      key="key_self_snackbar"
    >
      <Alert onClose={handleClose} severity={variant} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
