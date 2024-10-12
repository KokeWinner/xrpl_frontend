import Decimal from 'decimal.js';

import {
    Paper,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

export default function Trait({ prop, total }) {

    const theme = useTheme();

    const type = prop.type || prop.trait_type;
    const value = prop.value;
    const count = prop.count || 0;

    let rarity = 0;
    if (total > 0 && count > 0)
        rarity = new Decimal(count).mul(100).div(total).toDP(2, Decimal.ROUND_DOWN).toNumber();

    console.log(theme)
    return (
        <Paper
            sx={{
                width: '100%',
                // width: 91,
                // maxWidth
                height: "100%",
                borderRadius: '6px',
                border: `1px solid ${theme.general?.borderTrait}`,
                padding: 1,
                // margin: 1,
                textAlign: 'center',
                background: theme.general?.backgroundTrait
            }}
        >
            <Stack>
                <Typography sx={{ overflowWrap: 'break-word', textTransform: 'uppercase', color: 'springgreen', fontWeight: 700, fontSize: 11, color: theme.general?.borderTrait }}>
                    {type}
                </Typography>
                <Typography variant='h3'>
                    {value}
                </Typography>
                {total > 0 &&
                    <Typography variant="s7" sx={{ mt: 0.5, overflowWrap: 'break-word'}}><Typography variant="s15">{count}</Typography> ({rarity}%)</Typography>
                }
            </Stack>
        </Paper>
    );
}
