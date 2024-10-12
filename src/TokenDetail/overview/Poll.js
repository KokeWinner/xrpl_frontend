import React, { useState } from 'react';
import { Button, Typography, Stack, Paper, Grid } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import PropTypes from 'prop-types';

const Poll = ({ user, name }) => {
    const [vote, setVote] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const handleVote = (value) => {
        setVote(value);
        setShowResult(true);
    };

    return (
        <Paper elevation={3} sx={{ padding: 2, marginTop: 4 }}>
            <Grid container alignItems="center">
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" sx={{ fontSize: '1.0rem' }}>
                        How do you feel about {user} {name} today?
                    </Typography>
                    <Typography variant="p2">Vote to see what our Community thinks!</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    {!showResult ? (
                        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={{ xs: 2, md: 0 }}>
                            <Button variant="outlined" color="success" onClick={() => handleVote('Good')} startIcon={<ThumbUpAltIcon />}>
                                Good
                            </Button>
                            <Button variant="outlined" color="error" onClick={() => handleVote('Bad')} startIcon={<ThumbDownAltIcon />}>
                                Bad
                            </Button>
                        </Stack>
                    ) : (
                        <Typography variant="body1" mt={2} textAlign={{ xs: 'center', md: 'right' }}>
                            You voted: {vote}
                        </Typography>
                    )}
                </Grid>
            </Grid>
        </Paper>
    );
};

Poll.propTypes = {
    user: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
};

export default Poll;
