import { v4 as uuidv4 } from 'uuid';

// Material
import {
    Box,
    Button,
    Container,
    IconButton,
    List,
    ListItem,
    TextField,
    Typography,
} from '@mui/material';

// Iconify
import { Icon } from '@iconify/react';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { setMetadata, updateProperty } from 'src/redux/statusSlice';

export default function AddTraitDgContent({close}) {

    const dispatch = useDispatch()
    const properties = useSelector(state => state.status.metadata.properties)

    const addTraitItem = () => {
        const item = {
            id: uuidv4(),
            type: '',
            value: '',
        }
        dispatch(setMetadata({ properties: [...properties, item] }))
    }

    const deleteItem = (id) => {
        dispatch(setMetadata({ properties: properties.filter((item => item.id !== id)) }))
    }

    const handleValueChange = (e, id) => {
        const idx = properties.findIndex(item => item.id === id)
        dispatch(updateProperty({ value: { value: e.target.value }, idx }))
    }

    const handleTypeChange = (e, id) => {
        const idx = properties.findIndex(item => item.id === id)
        dispatch(updateProperty({ value: { type: e.target.value }, idx }))
    }
    return (
        <Container >
            <Typography variant='body1'>
                Properties show up underneath your item, are clickable, and can be filtered in your collection's sidebar.
            </Typography>
            <List>
                <ListItem sx={{ justifyContent: 'space-evenly' }}>
                    <Typography variant='caption'>Type</Typography>
                    <Typography variant='caption'>Name</Typography>
                </ListItem>
                {
                    properties && properties.map((trait) => (
                        <ListItem sx={{ justifyContent: 'space-between' }} key={trait.id}>
                            <IconButton edge="start" aria-label="delete"
                                onClick={() => { deleteItem(trait.id) }}
                                itemID={trait.id}
                            >
                                <Icon icon="akar-icons:cross" />
                            </IconButton>
                            <TextField
                                id="outlined-basic"
                                variant="outlined"
                                value={trait.type}
                                onChange={e => handleTypeChange(e, trait.id)}
                            />
                            <TextField
                                id="outlined-basic"
                                variant="outlined"
                                value={trait.value}
                                onChange={e => handleValueChange(e, trait.id)}
                            />
                        </ListItem>
                    ))
                }
                <ListItem >
                    <IconButton edge="start" aria-label="delete" onClick={addTraitItem}>
                        <Icon icon="carbon:add-alt" />
                    </IconButton>
                </ListItem>
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 2 }}>
                <Button
                    variant='contained'
                    onClick={close}
                >
                    Close
                </Button>
            </Box>
        </Container>
    );
}
