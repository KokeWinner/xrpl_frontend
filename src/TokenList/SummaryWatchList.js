// Material
import { withStyles } from '@mui/styles';
import {
    alpha,
    Link,
    Stack,
    Typography
} from '@mui/material';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Utils
import { fNumber } from 'src/utils/formatNumber';

// Components

const ContentTypography = withStyles({
    root: {
        color: alpha('#919EAB', 0.99)
    }
})(Typography);


export default function SummaryWatchList({}) {
    const { accountProfile, openSnackbar, setLoading } = useContext(AppContext);

    const account = accountProfile?.account;

    return (
        <Stack sx={{mt:2}}>
            <Typography variant='h1'>My Token Watchlist</Typography>

            {!account &&
                <ContentTypography variant='subtitle1' sx={{mt:2}}>
                    Please log in to view your Watchlist.
                </ContentTypography>
            }
        </Stack>
    )
}
