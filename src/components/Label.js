import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';

const { node, string, oneOf } = PropTypes;

const LabelWrapper = styled('span')(({ theme }) => ({
  backgroundColor: theme.colors.alpha.black[5],
  padding: theme.spacing(0.5, 1),
  fontSize: theme.typography.pxToRem(13),
  borderRadius: theme.general.borderRadius,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxHeight: theme.spacing(3),

  '&.MuiLabel': {
    '&-primary': {
      backgroundColor: theme.colors.primary.lighter,
      color: theme.palette.primary.main,
    },
    '&-black': {
      backgroundColor: theme.colors.alpha.black[100],
      color: theme.colors.alpha.white[100],
    },
    '&-secondary': {
      backgroundColor: theme.colors.secondary.lighter,
      color: theme.palette.secondary.main,
    },
    '&-success': {
      backgroundColor: theme.colors.success.lighter,
      color: theme.palette.success.main,
    },
    '&-warning': {
      backgroundColor: theme.colors.warning.lighter,
      color: theme.palette.warning.main,
    },
    '&-error': {
      backgroundColor: theme.colors.error.lighter,
      color: theme.palette.error.main,
    },
    '&-info': {
      backgroundColor: theme.colors.info.lighter,
      color: theme.palette.info.main,
    },
  },
}));

const Label = ({ variant = 'secondary', children, ...rest }) => (
  <LabelWrapper className={`MuiLabel-${variant}`} {...rest}>
    {children}
  </LabelWrapper>
);

Label.propTypes = {
  children: node,
  variant: oneOf([
    'primary',
    'black',
    'secondary',
    'error',
    'warning',
    'success',
    'info',
  ]),
};

export default Label;
