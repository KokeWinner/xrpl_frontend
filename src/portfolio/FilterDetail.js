// Material
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
    Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FactCheckIcon from '@mui/icons-material/FactCheck';

// Components

export default function FilterDetail({ boughtWithMints, onSaleCount, filter, setFilter, subFilter, setSubFilter, setPage }) {

    const handleFlagChange = (e) => {
        const value = e.target.value;
        let newFilter = filter ^ value;
        if (value === '4') {
            // 8 4 2 1
            // 0 1 1 1
            newFilter &= 0x07;
        } else if (value === '8') {
            // 8 4 2 1
            // 1 0 1 1
            newFilter &= 0x0B;
        }
        setFilter(newFilter);
        setPage(0);
    }

    const handleOnSaleFlagChange = (event) => {
        const value = event.target.value;
        setSubFilter(value);
        setPage(0);
    };

    return (
        <>
            <Stack sx={{ pr: 0 }}>
                <Accordion defaultExpanded>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2bh-content"
                        id="panel2bh-header"
                    >
                        <Stack spacing={2} direction='row'>
                            <FactCheckIcon />
                            <Typography variant='s3'>Status</Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <FormGroup sx={{ flexDirection: 'col' }}>
                            {/* <FormControlLabel
                                label={
                                    <Stack direction="row" spacing={0.5}>
                                        <Typography variant='s3'>Recently Minted {boughtWithMints > 0 && <Typography variant='s7'>({boughtWithMints})</Typography>}</Typography>
                                        <Tooltip title="Display recently Minted NFTs and being transferred to users. Or NFTs that pending to be accepted by users.">
                                            <Icon icon={infoFilled} />
                                        </Tooltip>
                                    </Stack>
                                }
                                value={2}
                                control={<Checkbox checked={(filter & 2) !== 0} onChange={handleFlagChange} />}
                            /> */}

                            <FormControlLabel
                                label={<Typography variant='s3'>On Sale {onSaleCount > 0 && <Typography variant='s7'>({onSaleCount})</Typography>}</Typography>}
                                value={4}
                                control={<Checkbox checked={(filter & 4) !== 0} onChange={handleFlagChange} />}
                            />

                            {(filter & 0x04) !== 0 &&
                                <FormControl sx={{ ml: 5 }}>
                                    {/* <FormLabel id="on-sale-sub-filter">On Sale sub</FormLabel> */}
                                    <RadioGroup
                                        aria-labelledby="demo-controlled-radio-buttons-group"
                                        name="controlled-radio-buttons-group"
                                        value={subFilter}
                                        onChange={handleOnSaleFlagChange}
                                    >
                                        <FormControlLabel value="pricenoxrp" control={<Radio />} label="Price (noXRP)" />
                                        <FormControlLabel value="pricexrpasc" control={<Radio />} label="Price (XRP, Asc)" />
                                        <FormControlLabel value="pricexrpdesc" control={<Radio />} label="Price (XRP, Desc)" />
                                    </RadioGroup>
                                </FormControl>
                            }
                        </FormGroup>


                    </AccordionDetails>
                </Accordion>

            </Stack>
        </>
    );
}
