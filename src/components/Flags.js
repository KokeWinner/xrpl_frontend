// Material
import {
    Stack,
    Tooltip,
    Typography
} from '@mui/material';

// Iconify
import { Icon } from '@iconify/react';

export default function Flags({ Flags }) {
    return (
        <Stack direction='row' alignItems='center' justifyContent='start' sx={{ fontSize: 20, gap: 2 }}>
            {(Flags & 0x00000001) !== 0 && <Tooltip title={<Typography sx={{ color: 'white' }}>Burnable</Typography>}><Icon icon='ps:feedburner' /></Tooltip>}
            {(Flags & 0x00000002) !== 0 && <Tooltip title={<Typography sx={{ color: 'white' }}>OnlyXRP</Typography>}><Icon icon="teenyicons:ripple-solid" /></Tooltip>}
            {(Flags & 0x00000004) !== 0 && <Tooltip title={<Typography sx={{ color: 'white' }}>TrustLine</Typography>}><Icon icon='codicon:workspace-trusted' /></Tooltip>}
            {(Flags & 0x00000008) !== 0 && <Tooltip title={<Typography sx={{ color: 'white' }}>Transferable</Typography>}><Icon icon='mdi:transit-transfer' /></Tooltip>}
        </Stack>
    );
}
