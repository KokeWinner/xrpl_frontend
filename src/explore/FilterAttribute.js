import { useState, useMemo } from 'react';
import { isEqual } from 'lodash';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Stack,
    Typography,
    Box,
    Chip,
    Tooltip,
    LinearProgress,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FilterListIcon from '@mui/icons-material/FilterList'
import { fIntNumber } from 'src/utils/formatNumber';

export default function FilterAttribute({ attrs, filterAttrs, setFilterAttrs }) {

    const [expanded, setExpanded] = useState(false);

    const [fAttrs, setFAttrs] = useState({});

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleAttrChange = (e) => {
        const value = e.target.value;

        if (fAttrs[value])
            delete fAttrs[value];
        else
            fAttrs[value] = true;

        setFAttrs({ ...fAttrs });
    }

    const handleApplyAttrFilter = (e) => {
        setFilterAttrs({ ...fAttrs });
    }

    const handleClearAttrFilter = (e) => {
        setFAttrs({});
        setExpanded(false);
    }

    const activeFiltersCount = useMemo(() => Object.keys(fAttrs).length, [fAttrs]);

    return (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                    <FilterListIcon sx={{ mr: 1 }} /> Filter Attributes
                </Typography>
                <Chip
                    label={`${activeFiltersCount} active`}
                    color={activeFiltersCount > 0 ? "primary" : "default"}
                    size="small"
                />
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 3 }}>
                {activeFiltersCount > 0 && (
                    <Button
                        variant="outlined"
                        onClick={handleClearAttrFilter}
                        size="small"
                        sx={{ borderRadius: 20, textTransform: 'none' }}
                    >
                        Clear All
                    </Button>
                )}
                {!isEqual(fAttrs, filterAttrs) && (
                    <Button
                        variant="contained"
                        onClick={handleApplyAttrFilter}
                        size="small"
                        sx={{ borderRadius: 20, textTransform: 'none' }}
                    >
                        Apply Filters
                    </Button>
                )}
            </Stack>

            {attrs.map((attr, idx) => {
                const itemCount = Object.keys(attr.items).length;
                const maxValue = Math.max(...Object.values(attr.items));
                return (
                    <Accordion
                        key={attr.title}
                        expanded={expanded === 'panel' + idx}
                        onChange={handleAccordionChange('panel' + idx)}
                        sx={{
                            mb: 2,
                            boxShadow: 'none',
                            '&:before': { display: 'none' },
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" width='100%' pr={1}>
                                <Typography variant='subtitle1' fontWeight="medium">{attr.title}</Typography>
                                <Tooltip title={`${itemCount} options available`}>
                                    <Chip label={itemCount} size="small" variant="outlined" />
                                </Tooltip>
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormGroup sx={{ flexDirection: 'column' }}>
                                {Object.entries(attr.items).map(([key, value]) => {
                                    const checkValue = `${attr.title}:${key}`;
                                    const isChecked = fAttrs[checkValue] === true;
                                    const percentage = (value / maxValue) * 100;
                                    return (
                                        <Stack key={checkValue} direction="row" justifyContent="space-between" alignItems="center" width='100%' pr={1} sx={{ mb: 1 }}>
                                            <FormControlLabel
                                                label={<Typography variant='body2'>{key}</Typography>}
                                                value={checkValue}
                                                control={
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onChange={handleAttrChange}
                                                        sx={{ '&.Mui-checked': { color: 'primary.main' } }}
                                                    />
                                                }
                                                sx={{ flexGrow: 1 }}
                                            />
                                            <Box sx={{ width: '30%', mr: 2 }}>
                                                <LinearProgress variant="determinate" value={percentage} sx={{ height: 8, borderRadius: 4 }} />
                                            </Box>
                                            <Typography variant='caption' color="text.secondary" sx={{ minWidth: 40, textAlign: 'right' }}>
                                                {fIntNumber(value)}
                                            </Typography>
                                        </Stack>
                                    )
                                })}
                            </FormGroup>
                        </AccordionDetails>
                    </Accordion>
                )
            })}
        </Box>
    );
}
