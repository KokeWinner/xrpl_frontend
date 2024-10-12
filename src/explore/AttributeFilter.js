import { useEffect, useState } from 'react';

// Material
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Stack,
    Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// Components
import { fIntNumber } from 'src/utils/formatNumber';

export default function AttributeFilter({ attrs, setFilterAttrs }) {

    const [attrFilter, setAttrFilter] = useState([])

    useEffect(() => {
        const tempAttrs = []
        for (const attr of attrs) {
            tempAttrs.push({
                trait_type: attr.title,
                value: []
            })
        }
        setAttrFilter(tempAttrs)

    }, [attrs])

    const handleAttrChange = (title, key) => {

        const tempAttrs = [...attrFilter]
        const found = tempAttrs.find(elem => elem.trait_type === title)

        if (found) {
            if (found.value.includes(key)) {
                let values = [...found.value]
                values.splice(found.value.indexOf(key), 1)
                found.value = values
            } else {
                found.value.push(key)
            }

            setAttrFilter(tempAttrs)
            setFilterAttrs(tempAttrs)
        }
    }

    return (
        <Stack sx={{ mt: 0, pr: 0 }}>
            {
                attrs.map((attr, idx) => {
                    const title = attr.title;
                    const items = attr.items;
                    const count = Object.keys(items).length;

                    return (
                        <Accordion
                            key={title}
                            // defaultExpanded={idx === 0}
                            disableGutters
                            sx={{
                                borderBottom: 0,
                                borderLeft: 0,
                                borderRight: 0,
                                '&:first-of-type': {
                                    borderRadius: 0,
                                },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                disableGutters
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="center" width='100%' pr={1}>
                                    <Typography variant='s5'>{title}</Typography>
                                    <Typography variant='s7'>{count}</Typography>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <FormGroup sx={{ flexDirection: 'col' }}>
                                    {
                                        Object.keys(items).map((key) => {
                                            const data = items[key];
                                            const isChecked = attrFilter.find(elem => elem.trait_type === title)?.value?.includes(key) === true;
                                            return (
                                                <Stack key={title + key} direction="row" justifyContent="space-between" alignItems="center" width='100%' pr={1}>
                                                    <FormControlLabel
                                                        label={
                                                            <Typography >{key}</Typography>
                                                        }
                                                        // value={checkValue}
                                                        control={<Checkbox checked={isChecked ?? false} onChange={() => handleAttrChange(title, key)} />}
                                                    />
                                                    <Typography variant='s7'>{fIntNumber(data.count)}</Typography>
                                                </Stack>
                                            )
                                        })
                                    }
                                </FormGroup>
                            </AccordionDetails>
                        </Accordion>
                    )
                })}
        </Stack>
    );
}