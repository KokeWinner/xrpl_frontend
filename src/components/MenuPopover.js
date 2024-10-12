import React from 'react';
import PropTypes from 'prop-types';
import { Popover } from '@mui/material';
import { alpha, styled } from '@mui/material';

MenuPopover.propTypes = {
  children: PropTypes.node.isRequired,
  sx: PropTypes.object,
};

export default function MenuPopover({ children, sx, ...other }) {
  return (
    <Popover
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          mt: 1.5,
          ml: 0.5,
          overflow: 'inherit',
          border: (theme) => `solid 1px ${alpha('#919EAB', 0.08)}`,
          width: 200,
          ...sx,
        },
      }}
      {...other}
    >
      {children}
    </Popover>
  );
}
