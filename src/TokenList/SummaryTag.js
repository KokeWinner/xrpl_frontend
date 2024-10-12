// Material
import { withStyles } from '@mui/styles';
import {
    alpha,
    Link,
    Stack,
    Typography
} from '@mui/material';

// Utils
import { fNumber } from 'src/utils/formatNumber';

// Components

const ContentTypography = withStyles({
    root: {
        color: alpha('#919EAB', 0.99)
    }
})(Typography);


export default function SummaryTag({tagName}) {

    return (
        <Stack sx={{mt:2}}>
            <Typography variant='h1'>Top {tagName} Tokens Ranked by Trading Volume</Typography>

            <ContentTypography variant='subtitle1' sx={{mt:2}}>
            This page showcases the top {tagName} tokens, ranked by 24-hour volume in descending order, with the largest volume first. To reorder the list, simply click on one of the options, such as 24h or 7d, for a different perspective on the sector.
            </ContentTypography>
        </Stack>
    )
}
