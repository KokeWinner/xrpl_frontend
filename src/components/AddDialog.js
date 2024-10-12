import { useState, useEffect } from 'react';

// Material
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    TextField
} from '@mui/material';

import {
    AddCircle as AddCircleIcon
} from '@mui/icons-material';

export default function EditDialog({label, onAddTag}) {
    const [val, setVal] = useState('');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setVal('');
    }, []);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setVal('');
        setOpen(false);
    };

    const handleOK = () => {
        setOpen(false);
        onAddTag(val);
        setVal('');
    };

    const onChangeValue = (event) => {
        setVal(event.target.value);
    };

    return (
        <div>
            <IconButton onClick={handleClickOpen} size="small" edge="end" aria-label="save">
                <AddCircleIcon fontSize="inherit" />
            </IconButton>
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <TextField
                        value={val}
                        onChange={onChangeValue}
                        autoFocus
                        margin="dense"
                        id="name"
                        label={label}
                        variant="standard"
                        style ={{width: '300px'}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleOK}>OK</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
