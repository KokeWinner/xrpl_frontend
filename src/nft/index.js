// Material
import {
    useMediaQuery,
    Grid,
    useTheme
} from '@mui/material';

// Utils
import { NFToken } from "src/utils/constants";

// Components
import NFTDetails from './NFTDetails';
import NFTDetailsMobile from './NFTDetailsMobile';
import NFTActions from './NFTActions';
import NFTActionsBulk from './NFTActionsBulk';

export default function Detail({nft}) {
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const {
        status,
        costs
    } = nft;

    return (
        isMobile && status !== NFToken.SELL_WITH_MINT_BULK ?
            <NFTDetailsMobile nft={nft} />
            :
            <Grid container spacing={3} justifyContent='center'>
                <Grid item xs={12} md={5.16}>{/* trying to fit 480px image, was 5/7 */}
                    <NFTDetails nft={nft} />
                </Grid>
                <Grid item xs={12} md={6.84}>
                    {status === NFToken.SELL_WITH_MINT_BULK ?
                        <NFTActionsBulk nft={nft} />
                    :
                        <NFTActions nft={nft} />
                    }
                </Grid>
            </Grid>
    );
}
