import React, { useState, useEffect } from 'react';
import { alpha, styled, useTheme, useMediaQuery, Box, Dialog, DialogContent, DialogTitle, IconButton, Link, Stack, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const CustomDialog = styled(Dialog)(({ theme }) => ({
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)', // Fix on Mobile
  backgroundColor: alpha(theme.palette.background.paper, 0.0),
  borderRadius: '0px',
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const StyledLinkTypography = styled(Typography)(({ theme }) => ({
    borderRadius: '2px',
    border: `1px solid ${theme.palette.primary.main}`,
    padding: theme.spacing(1),
    marginTop: theme.spacing(2),
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.primary.light
    }
  }));

const CustomDialogTitle = (props) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export default function CustomQRDialog({ open, type, qrUrl, nextUrl, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [showQR, setShowQR] = useState(false);
  const [notificationClicked, setNotificationClicked] = useState(false);

  useEffect(() => {
    if (open) {
      setShowQR(false);
      setNotificationClicked(false);
    }
  }, [open]);

  const handleQRButtonClick = () => {
    setShowQR(true);
    setNotificationClicked(true);
  };

  return (
    <CustomDialog
      fullScreen={fullScreen}
      fullWidth={true}
      maxWidth="xs"
      onClose={onClose}
      open={open}
      sx={{ zIndex: 1305 }}
    >
      
      <DialogContent dividers>
        <Stack alignItems="center" spacing={2}>
          <Typography variant="h3">{type}</Typography>
          <Typography variant="subtitle1">Sign the transaction on your Xaman App</Typography>
          {!notificationClicked && (
            <Link
              component="button"
              underline="hover"
              variant="body2"
              color="inherit"
              onClick={handleQRButtonClick}
            >
              <Typography variant="caption" color="error">
                Didn't receive a notification? Click here to scan QR!
              </Typography>
            </Link>
          )}
        </Stack>
        <div
          style={{
            display: showQR ? 'flex' : 'none',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 50,
            marginTop: 50,
          }}
        >
          <Box component="img" alt=" Xaman QR" src={qrUrl} sx={{ mb: 2 }} />

          <Link
            underline="none"
            color="inherit"
            target="_blank"
            href={nextUrl}
            rel="noreferrer noopener nofollow"
          >
            <StyledLinkTypography variant="h4" color="primary">
              Open in Xaman
            </StyledLinkTypography>
          </Link>
        </div>
      </DialogContent>
    </CustomDialog>
  );
}
