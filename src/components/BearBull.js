import PropTypes from 'prop-types';

// Material
import {
    Stack,
    styled,
    Typography,
    useTheme
} from '@mui/material';

// Utils
import { fPercent } from 'src/utils/formatNumber';

// Iconify
import { Icon } from '@iconify/react';
import caretDown from '@iconify/icons-bx/caret-down';
import caretUp from '@iconify/icons-bx/caret-up';

// ----------------------------------------------------------------------

const Bearish = styled('span') (
    ({ theme }) => `
        color: ${theme.palette.error.main};
        font-size: 14px;
    `
);

const Bullish = styled('span') (
    ({ theme }) => `
        color: ${theme.palette.primary.light};
        font-size: 14px;
    `
);

BearBull.propTypes = {
    value: PropTypes.number
};

export default function BearBull({value}) {
    const theme = useTheme();
    const pro = fPercent(value);

    let strPro = 0;
    if (pro < 0) {
        strPro = -pro;
        strPro = strPro + ' %';
    } else {
        strPro = pro + ' %';
    }
    return (
        <>
            {pro < 0 ? (
                <span>
                    <Icon icon={caretDown} color={theme.palette.error.main}/>
                    <Bearish>{strPro}</Bearish>
                </span>
            ) : (
                <span>
                    <Icon icon={caretUp} color={theme.palette.primary.light}/>
                    <Bullish>{strPro}</Bullish>
                </span>
            )}
        </>
    );
}
