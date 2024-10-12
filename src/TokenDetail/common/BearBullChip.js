import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { Chip, Tooltip, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import caretDown from '@iconify/icons-bx/caret-down';
import caretUp from '@iconify/icons-bx/caret-up';
import { fPercent } from 'src/utils/formatNumber';

const BearBullChip = ({ value, tooltip }) => {
  const formattedPro = parseFloat(value).toFixed(2); // Format to two decimal places
  const isBearish = formattedPro < 0;
  const strPro = `${isBearish ? -formattedPro : formattedPro} %`;

  const ChipComponent = isBearish ? BearishChip : BullishChip;

  return (
    <Tooltip title={tooltip}>
      <ChipComponent
        icon={<Icon icon={isBearish ? caretDown : caretUp} width="16" height="16" color="#fff" />}
        size="small"
        label={
          <WhiteTextTypography variant="subtitle2" style={{ color: '#FFFFFF !important' }}>
            {strPro}
          </WhiteTextTypography>
        }
        style={{ borderRadius: '8px' }}
      />
    </Tooltip>
  );
};

BearBullChip.propTypes = {
  value: PropTypes.number,
  tooltip: PropTypes.any,
};

const BearishChip = withStyles({
  root: {
    backgroundColor: '#B72136 !important',
  },
})(Chip);

const BullishChip = withStyles({
  root: {
    backgroundColor: '#007B55 !important',
  },
})(Chip);

const WhiteTextTypography = withStyles({
  root: {
    color: '#FFFFFF !important',
  },
})(Typography);

export default BearBullChip;
