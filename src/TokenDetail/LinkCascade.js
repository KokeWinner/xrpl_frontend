// Material
import {
    Link,
    Stack,
    Typography
} from '@mui/material';

// Iconify icons
import { Icon } from '@iconify/react';
import twotoneGreaterThan from '@iconify/icons-ic/twotone-greater-than';
// ---------------------------------------------------

export default function LinkCascade({token, tabID, tabLabels}) {
    return (
        <Stack direction='row' spacing={1} sx={{ mt: 1 }} alignItems='center' color={'text.secondary'}>
            <Link
                underline="none"
                color="inherit"
                href={`/`}
                rel="noreferrer noopener nofollow"
            >
                <Typography variant='link_cascade' color='primary'>Tokens</Typography>
            </Link>
            <Icon icon={twotoneGreaterThan} width='12' height='12' style={{marginTop:'3'}}/>
            
            {tabID > 0 ? (
                <>
                    <Link
                        underline="none"
                        color="inherit"
                        href={`/token/${token.slug}`}
                        rel="noreferrer noopener nofollow"
                    >
                        <Typography variant='link_cascade' color={'primary'}>{token.name}</Typography>
                    </Link>
                    <Icon icon={twotoneGreaterThan} width='12' height='12' style={{marginTop:'3'}}/>
                    <Typography variant='link_cascade'>{tabLabels[tabID]}</Typography>
                </>
            ):(
                <Typography variant='link_cascade'>{token.name}</Typography>
            )}
        </Stack>
    );
}

