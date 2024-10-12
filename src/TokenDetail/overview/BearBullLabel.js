import PropTypes from 'prop-types';

// Material
import { withStyles } from '@mui/styles';
import {
    Stack,
    Typography
} from '@mui/material';

// Utils
import { fPercent } from 'src/utils/formatNumber';

// Iconify
import { Icon } from '@iconify/react';
import caretDown from '@iconify/icons-bx/caret-down';
import caretUp from '@iconify/icons-bx/caret-up';

// ----------------------------------------------------------------------

const BearishTypography = withStyles({
    root: {
        color: "#FF6C40"
    }
})(Typography);

const BullishTypography = withStyles({
    root: {
        color: "#54D62C"
    }
})(Typography);

BearBullLabel.propTypes = {
    value: PropTypes.number,
    variant: PropTypes.string
};

export default function BearBullLabel({ value, variant }) {
    const formattedValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);

    const isBearish = value < 0;
    const strPro = `${isBearish ? '' : ''}${formattedValue} %`;

    return (
        <>
            {isBearish ? (
                <Stack direction="row" spacing={0.1} justifyContent="flex-start" alignItems='center'>
                    <Icon icon={caretDown} color="#FF6C40"/>
                    <BearishTypography variant={variant} noWrap>{strPro}</BearishTypography>
                </Stack>
            ) : (
                <Stack direction="row" spacing={0.1} justifyContent="flex-start" alignItems='center'>
                    <Icon icon={caretUp} color="#54D62C"/>
                    <BullishTypography variant={variant} noWrap>{strPro}</BullishTypography>
                </Stack>
            )}
        </>
    );
}
