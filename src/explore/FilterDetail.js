import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    Radio,
    RadioGroup,
    Stack,
    Tooltip,
    Typography,
    Box,
    Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { Icon } from '@iconify/react';
import infoFilled from '@iconify/icons-ep/info-filled';
import { styled } from '@mui/material/styles';

// Styled components
const StyledAccordion = styled(Accordion)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    '&:before': {
        display: 'none',
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

// Components
import AttributeFilter from './AttributeFilter';

export default function FilterDetail({
    collection,
    filter,
    setFilter,
    subFilter,
    setSubFilter,
    setFilterAttrs,
    setPage // reset the page when applying a filter
}) {
    const type = collection?.type;
    const extra = collection?.extra;
    const attrs = collection?.attrs || [];

    const handleFlagChange = (e) => {
        const value = e.target.value;
        let newFilter = filter ^ value;
        if (value === '4') {
            // 16 8 4 2 1
            //  0 0 1 1 1
            newFilter &= 0x07;
        } else if (value === '8') {
            // 16 8 4 2 1
            //  0 1 0 1 1
            newFilter &= 0x0b;
        } else if (value === '16') {
            // 16 8 4 2 1
            //  1 0 0 1 1
            newFilter &= 0x13;
        }
        setFilter(newFilter);
        setPage(0);
    };

    const handleOnSaleFlagChange = (event) => {
        const value = event.target.value;
        setSubFilter(value);
        setPage(0);
    };

    return (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, p: 2 }}>
            <Stack spacing={2}>
                <StyledAccordion defaultExpanded>
                    <StyledAccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                    >
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <FactCheckIcon color="primary" />
                            <Typography variant="h6" color="primary">Status</Typography>
                        </Stack>
                    </StyledAccordionSummary>
                    <AccordionDetails>
                        <FormGroup>
                            {type === 'bulk' && (
                                <FormControlLabel
                                    label={
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body1">
                                                Buy with Mints
                                            </Typography>
                                            <Chip
                                                label={extra?.buyWithMints}
                                                size="small"
                                                color="primary"
                                            />
                                            <Tooltip title="Disabled on Spinning collections, only enabled on Bulk collections.">
                                                <Icon icon={infoFilled} />
                                            </Tooltip>
                                        </Stack>
                                    }
                                    value={1}
                                    control={
                                        <Checkbox
                                            checked={(filter & 1) !== 0}
                                            onChange={handleFlagChange}
                                            color="primary"
                                        />
                                    }
                                />
                            )}
                            {type !== 'normal' && (
                                <FormControlLabel
                                    label={
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body1">
                                                Recently Minted
                                            </Typography>
                                            <Chip
                                                label={extra?.boughtWithMints}
                                                size="small"
                                                color="primary"
                                            />
                                            <Tooltip title="Display recently Minted NFTs and being transferred to users. Or NFTs that pending to be accepted by users.">
                                                <Icon icon={infoFilled} />
                                            </Tooltip>
                                        </Stack>
                                    }
                                    value={2}
                                    control={
                                        <Checkbox
                                            checked={(filter & 2) !== 0}
                                            onChange={handleFlagChange}
                                            color="primary"
                                        />
                                    }
                                />
                            )}
                            <FormControlLabel
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body1">
                                            Buy Now
                                        </Typography>
                                        <Chip
                                            label={extra?.onSaleCount}
                                            size="small"
                                            color="primary"
                                        />
                                    </Stack>
                                }
                                value={4}
                                control={
                                    <Checkbox
                                        checked={(filter & 4) !== 0}
                                        onChange={handleFlagChange}
                                        color="primary"
                                    />
                                }
                            />

                            {(filter & 0x04) !== 0 && (
                                <FormControl sx={{ ml: 4, mt: 1, border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}>
                                    <Typography variant="subtitle2" gutterBottom>Sort by:</Typography>
                                    <RadioGroup
                                        aria-labelledby="on-sale-sub-filter"
                                        name="on-sale-sub-filter"
                                        value={subFilter}
                                        onChange={handleOnSaleFlagChange}
                                    >
                                        <FormControlLabel
                                            value="pricenoxrp"
                                            control={<Radio color="primary" />}
                                            label={<Typography variant="body2">Price No XRP</Typography>}
                                        />
                                        <FormControlLabel
                                            value="pricexrpasc"
                                            control={<Radio color="primary" />}
                                            label={<Typography variant="body2">Price Low</Typography>}
                                        />
                                        <FormControlLabel
                                            value="pricexrpdesc"
                                            control={<Radio color="primary" />}
                                            label={<Typography variant="body2">Price High</Typography>}
                                        />
                                    </RadioGroup>
                                </FormControl>
                            )}


                            <FormControlLabel
                                label={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body1">
                                            Rarity
                                        </Typography>
                                        <Tooltip title="Sort NFTs with rarity">
                                            <Icon icon={infoFilled} />
                                        </Tooltip>
                                    </Stack>
                                }
                                value={16}
                                control={
                                    <Checkbox
                                        checked={(filter & 16) !== 0}
                                        onChange={handleFlagChange}
                                        color="primary"
                                    />
                                }
                            />
                        </FormGroup>
                    </AccordionDetails>
                </StyledAccordion>

                <StyledAccordion defaultExpanded>
                    <StyledAccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2bh-content"
                        id="panel2bh-header2"
                    >
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <BookmarkAddedIcon color="primary" />
                            <Typography variant="h6" color="primary">Attributes</Typography>
                        </Stack>
                    </StyledAccordionSummary>
                    <AccordionDetails>
                        {!attrs || attrs.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" align="center">
                                No Attributes Available
                            </Typography>
                        ) : (
                            <AttributeFilter
                                setFilterAttrs={setFilterAttrs}
                                attrs={attrs}
                            />
                        )}
                    </AccordionDetails>
                </StyledAccordion>
            </Stack>
        </Box>
    );
}
