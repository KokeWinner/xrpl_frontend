import PropTypes from 'prop-types';

// Material
import { withStyles, useTheme } from '@mui/styles';
import {
    Stack,
    Typography
} from '@mui/material';

// Iconify
import { Icon } from '@iconify/react';
import caretDown from '@iconify/icons-bx/caret-down';
import caretUp from '@iconify/icons-bx/caret-up';

// ----------------------------------------------------------------------

const BearishTypography = withStyles((theme) => ({
    root: {
        color: theme.palette.error.main
    }
}))(Typography);

const BullishTypography = withStyles((theme) => ({
    root: {
        color: theme.palette.primary.light
    }
}))(Typography);

BearBullLabel.propTypes = {
    value: PropTypes.number,
    variant: PropTypes.string
};

function abs(num) {
    if (num < 0)
        return -num;
    return num;
}

export default function BearBullLabel({ value, variant }) {
    const theme = useTheme();
    const formattedValue = parseFloat(value).toFixed(2); // Format to two decimal places
    const isBearish = formattedValue < 0;
    const strPro = `${isBearish ? -formattedValue : formattedValue} %`;

    return (
        <>
            {isBearish ? (
                <Stack direction="row" spacing={0.1} justifyContent="flex-end" alignItems='center'>
                    <Icon icon={caretDown} color={theme.palette.error.main}/>
                    <BearishTypography variant={variant} noWrap>{strPro}</BearishTypography>
                </Stack>
            ) : (
                <Stack direction="row" spacing={0.1} justifyContent="flex-end" alignItems='center'>
                    <Icon icon={caretUp} color={theme.palette.primary.light}/>
                    <BullishTypography variant={variant} noWrap>{strPro}</BullishTypography>
                </Stack>
            )}
        </>
    );
}
