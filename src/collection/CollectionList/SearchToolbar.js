// Material
import {
    styled,
    Box,
    InputAdornment,
    OutlinedInput,
} from '@mui/material';

// Iconify
import { Icon } from '@iconify/react';
import searchFill from '@iconify/icons-eva/search-fill';

// ----------------------------------------------------------------------
const RootStyle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    // borderBottom: `1px solid ${alpha('#CBCCD2', 0.1)}`,
}));

const SearchBox = styled(OutlinedInput)(({ theme }) => ({
    transition: theme.transitions.create(['width'], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter
    }),
    '& fieldset': {
        borderWidth: `1px !important`,
        borderColor: `${theme.palette.grey[500_32]} !important`
    }
}));

// ----------------------------------------------------------------------
export default function SearchToolbar({
    filter,
    setFilter,
}) {

    return (
        <RootStyle sx={{mb: 1 }}>
            
        </RootStyle>
    );
}
