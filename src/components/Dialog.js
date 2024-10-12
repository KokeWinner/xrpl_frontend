import React, { forwardRef } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { DialogContent, Grid } from '@mui/material';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CustomDialog({ open, title, content, handleContinue, handleClose }) {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
      PaperProps={{
        sx: {
          maxWidth: "300px"
        }
      }}
      sx={{
        zIndex: 1304
      }}
    >
      <DialogTitle sx={{ textAlign: "center" }}>{title}</DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>{content}</DialogContent>
      <DialogActions>
        <Grid container>
          <Grid item xs={6}>
            <Button fullWidth onClick={handleClose}>Cancel</Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth onClick={handleContinue} color="error">Continue</Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
}
