// Material
import {
    alpha,
    styled,
    Link,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';

import FiberNewIcon from '@mui/icons-material/FiberNew';
// import DoNotTouchIcon from '@mui/icons-material/DoNotTouch';
// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
    zIndex: 999,
    right: 0,
    display: 'flex',
    cursor: 'pointer',
    position: 'fixed',
    alignItems: 'center',
    top: theme.spacing(13),
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(0.7),
    paddingBottom: theme.spacing(0.7),
    // boxShadow: theme.customShadows.z20,
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)', // Fix on Mobile
    // color: theme.palette.text.widget,
    // backgroundColor: theme.palette.background.widget,
    backgroundColor: alpha('#8C7CF0', 0.08),
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
}));

// ----------------------------------------------------------------------
export default function WidgetNew({showNew, setShowNew}) {
    return (
        <Link
            component="button"
            underline="none"
            variant="body2"
            color={showNew?'error':'inherit'}
            onClick={() => {
                setShowNew(!showNew);
            }}
        >
            <RootStyle>
                <Stack direction="row" spacing={0.8} sx={{ p:0 }} alignItems='center'>
                    <FiberNewIcon />
                    <Typography align="center" style={{ wordWrap: "break-word" }} variant="caption" >
                        Recent
                    </Typography>
                </Stack>
            </RootStyle>
        </Link>
    );
}
