import {CopyToClipboard} from 'react-copy-to-clipboard';

// Material
import {
    Avatar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    IconButton,
    Link,
    Stack,
    Tooltip,
    Typography,
    Box,
    Paper,
    Chip,
    Grid,
} from '@mui/material'
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ArticleIcon from '@mui/icons-material/Article';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';

// Iconify
import { Icon } from '@iconify/react';

import infoFilled from '@iconify/icons-ep/info-filled';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Utils
import { fVolume } from 'src/utils/formatNumber';
import { convertHexToString, parseNFTokenID } from 'src/utils/parse/utils';

// Components
import NFTPreview from './NFTPreview';
import FlagsContainer from 'src/components/Flags';
import Properties from './Properties';

function getProperties(meta) {
    const properties = [];
    if (!meta) return [];

    // Attributes
    try {
        const attributes = meta.attributes;
        if (attributes && attributes.length > 0) {
            for (const attr of attributes) {
                const type = attr.type || attr.trait_type;
                const value = attr.value;
                properties.push({type, value});
            }
        }
    } catch (e) {}

    // Other props
    const props = [
        'Rarity',
        'Signature',
        'Background',
        'Base',
        'Mouth',
        'Accessories',
        'Base Effects',
        // ==============
        'Blade Effect',
        'End Scene',
        'Music',
        'Blades In Video',
        // ==============
        'Special',
    ];

    try {
        for (const prop of props) {
            if (meta[prop]) {
                properties.push({type: prop, value: meta[prop]});
            }
        }
    } catch (e) {}

    return properties;

}

// Styled components for a more polished look
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  '&:before': {
    display: 'none',
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  fontWeight: 'bold',
}));

export default function NFTDetails({nft}) {

    const { accountProfile, openSnackbar } = useContext(AppContext);

    const {
        uuid,
        name,
        collection,
        account,
        date,
        meta,
        dfile,
        URI,
        cslug,
        NFTokenID,
        props,
        total,
        volume,
        rarity,
        rarity_rank,
        files
    } = nft;

    const ParsedURI = convertHexToString(URI);

    const {
        flag,
        royalty,
        issuer,
        taxon,
        transferFee
    } = parseNFTokenID(NFTokenID);

    let strDateTime = '';
    if (date) {
      try {
        const dt = new Date(date);
        if (!isNaN(dt.getTime())) {  // Check if the date is valid
          const strDate = dt.toLocaleDateString();
          const strTime = dt.toLocaleTimeString();
          strDateTime = `${strDate} ${strTime}`;
        }
      } catch (error) {
        console.error('Error formatting date:', error);
      }
    }

    const collectionName = collection || meta?.collection?.name || '[No Collection]';

    const properties = props || getProperties(meta);

    return (
        <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>{name || 'Untitled NFT'}</Typography>
                <NFTPreview nft={nft} />
                
                <Box sx={{ mt: 4 }}>
                    <StyledAccordion defaultExpanded>
                        <StyledAccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel3bh-content"
                            id="panel3bh-header"
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Icon icon='majesticons:checkbox-list-detail-line' fontSize={25} />
                                <Typography variant="h6">Properties</Typography>
                            </Stack>
                        </StyledAccordionSummary>
                        <AccordionDetails>
                            {properties && properties.length > 0 ? (
                                <Properties properties={properties} total={total} />
                            ) : (
                                <Typography align="center">No Properties</Typography>
                            )}
                        </AccordionDetails>
                    </StyledAccordion>

                    <StyledAccordion>
                        <StyledAccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <ArticleIcon />
                                <Typography variant="h6">Details</Typography>
                            </Stack>
                        </StyledAccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>Flags:</Typography>
                                    <FlagsContainer Flags={flag} />
                                </Grid>
                                {strDateTime && (
                                    <Grid item xs={12}>
                                        <StyledChip label={strDateTime} variant="outlined" />
                                    </Grid>
                                )}
                            </Grid>
                            {rarity_rank > 0 &&
                                <Stack direction="row" spacing={2} sx={{mt: 2}}>
                                    <Typography variant="caption">Rarity Rank</Typography>
                                    <Typography variant="s6"># {rarity_rank}</Typography>
                                </Stack>
                            }
                            <Stack direction="row" spacing={2} sx={{mt: 2}}>
                                <Typography variant="caption">Taxon</Typography>
                                <Typography variant="s6">{taxon}</Typography>
                                <Typography variant="caption">Transfer Fee</Typography>
                                <Typography variant="s6">{transferFee} %</Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} sx={{mt: 2}}>
                                <Typography variant='caption'>Collection</Typography>
                                {cslug ? (
                                    <Link href={`/collection/${cslug}`} underline='none'>
                                        <Typography sx={{pl:1}}>{collectionName}</Typography>
                                    </Link>
                                ):(
                                    <Typography sx={{pl:1}}>{collectionName}</Typography>
                                )}
                            </Stack>
                            <Stack direction="row" spacing={2} sx={{mt: 2}}>
                                <Typography variant="caption">Volume</Typography>
                                <Stack direction="row" spacing={0.5} alignItems='center'>
                                <Typography>✕</Typography>
                                    <Typography variant="s6">{fVolume(volume || 0)}</Typography>
                                    <Tooltip title={<Typography variant="body2">Traded volume on XRPL</Typography>}>
                                        <Icon icon={infoFilled} />
                                    </Tooltip>
                                </Stack>
                            </Stack>
                            <Divider sx={{mt:2, mb:2}}/>

                            <Stack spacing={1}>
                                <Typography variant="caption">Owner</Typography>
                                <Stack direction="row" spacing={0.2} alignItems="center" sx={{display: 'inline-flex', overflowWrap: 'anywhere' }}>
                                    <Link
                                        href={`/account/${account}`}
                                        underline='hover'
                                        // target="_blank"
                                        variant='info'
                                        // rel="noreferrer noopener nofollow"
                                    >
                                        <Typography sx={{ml:1}}>{account}</Typography>
                                    </Link>
                                    <Link
                                        underline="none"
                                        color="inherit"
                                        target="_blank"
                                        href={`https://bithomp.com/explorer/${account}`}
                                        rel="noreferrer noopener nofollow"
                                    >
                                        <Tooltip title="Check on Bithomp">
                                            <IconButton edge="end" aria-label="bithomp" size="small">
                                                <Avatar alt="bithomp" src="/static/bithomp.ico" sx={{ width: 16, height: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Link>
                                    <CopyToClipboard text={account} onCopy={()=>openSnackbar('Copied!', 'success')}>
                                        <Tooltip title='Click to copy'>
                                            <IconButton size="small">
                                                <ContentCopyIcon fontSize="small" sx={{ width: 16, height: 16 }}/>
                                            </IconButton>
                                        </Tooltip>
                                    </CopyToClipboard>
                                </Stack>
                            </Stack>
                            <Divider sx={{mt:2, mb:2}}/>

                            <Stack spacing={1}>
                                <Typography variant="caption">Issuer</Typography>
                                <Stack direction="row" spacing={0.2} alignItems="center" sx={{display: 'inline-flex', overflowWrap: 'anywhere' }}>
                                    <Link
                                        href={`/account/${issuer}`}
                                        underline='hover'
                                        // target="_blank"
                                        variant='info'
                                        // rel="noreferrer noopener nofollow"
                                    >
                                        <Typography sx={{ml:1}}>{issuer}</Typography>
                                    </Link>
                                    <Link
                                        underline="none"
                                        color="inherit"
                                        target="_blank"
                                        href={`https://bithomp.com/explorer/${issuer}`}
                                        rel="noreferrer noopener nofollow"
                                    >
                                        <Tooltip title="Check on Bithomp">
                                            <IconButton edge="end" aria-label="bithomp" size="small">
                                                <Avatar alt="bithomp" src="/static/bithomp.ico" sx={{ width: 16, height: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Link>
                                    <CopyToClipboard text={issuer} onCopy={()=>openSnackbar('Copied!', 'success')}>
                                        <Tooltip title='Click to copy'>
                                            <IconButton size="small">
                                                <ContentCopyIcon fontSize="small" sx={{ width: 16, height: 16 }}/>
                                            </IconButton>
                                        </Tooltip>
                                    </CopyToClipboard>
                                </Stack>
                            </Stack>
                            <Divider sx={{mt:2, mb:2}}/>

                            <Stack spacing={1}>
                                <Typography variant="caption">NFTokenID</Typography>
                                <Link
                                    href={`https://bithomp.com/explorer/${NFTokenID}`}
                                    target='_blank'
                                    variant='info'
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography
                                        sx={{ml:1}}
                                        style={{ wordWrap: "break-word" }}
                                    >
                                        {NFTokenID}
                                    </Typography>
                                </Link>
                            </Stack>
                            <Divider sx={{mt:2, mb:2}}/>

                            <Stack spacing={1} mt={1}>
                            <Typography variant='caption'>
                                {`Parsed media files${files?.filter(file => file.isIPFS).length ? ' (IPFS):' : ':'}`}
                            </Typography>
                            {files?.map((file, index) => {
                                // Determine the href for the "Cached" link
                                let cachedHref;
                                if (file.isIPFS && file.IPFSPinned) {
                                    cachedHref = `https://gateway.xrpnft.com/ipfs/${file.IPFSPath}`;
                                } else if (!file.isIPFS && file.dfile ) {
                                    cachedHref = `https://s2.xrpnft.com/d1/${file.dfile}`;
                                }

                                return (
                                <Stack key={file.type} spacing={1} alignItems="flex-start">
                                    <Typography variant='caption'>{`${file.type}:`}</Typography>
                                    <Typography variant='body2' sx={{ display: 'inline-flex', overflowWrap: 'anywhere' }}>
                                    {/^https?:\/\//.test(file.parsedUrl) ? (
                                        <Link
                                        href={file.parsedUrl}
                                        sx={{ display: 'inline-flex', overflowWrap: 'anywhere' }}
                                        underline='hover'
                                        target="_blank"
                                        variant='body2'
                                        rel="noreferrer noopener nofollow"
                                        >
                                        {file.parsedUrl}
                                        </Link>
                                    ) : (
                                        file.parsedUrl
                                    )}
                                    {cachedHref && (
                                        <Link
                                        href={cachedHref}
                                        sx={{ display: 'inline-flex', whiteSpace: 'nowrap', ml: 1 }}
                                        underline='hover'
                                        target="_blank"
                                        variant='body2'
                                        rel="noreferrer noopener nofollow"
                                        >
                                        Cached
                                        </Link>
                                    )}
                                    </Typography>
                                </Stack>
                                );
                            })}
                            </Stack>
                            <Divider sx={{mt:2, mb:2}}/>

                        </AccordionDetails>
                    </StyledAccordion>

                    <StyledAccordion>
                        <StyledAccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel2bh-content"
                            id="panel2bh-header"
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <DescriptionIcon />
                                <Typography variant="h6">Description</Typography>
                            </Stack>
                        </StyledAccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body1">
                                {meta?.description || 'No description available for this item.'}
                            </Typography>
                        </AccordionDetails>
                    </StyledAccordion>
                </Box>
            </Paper>
        </Box>
    );
}
