import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
// Material
import { Grid } from '@mui/material';

// Components
import PairsList from './PairsList';

// ----------------------------------------------------------------------

export default function Market({ token }) {
    const BASE_URL = process.env.API_URL;
    const [pairs, setPairs] = useState([]);

    const getPairs = useCallback(() => {
        axios.get(`${BASE_URL}/pairs?md5=${token.md5}`)
            .then(res => {
                if (res.status === 200 && res.data) {
                    setPairs(res.data.pairs);
                }
            })
            .catch(err => {
                console.error("Error on getting pairs:", err);
            });
    }, [BASE_URL, token.md5]);

    useEffect(() => {
        getPairs();

        // Uncomment for periodic updates
        // const timer = setInterval(getPairs, 10000);
        // return () => clearInterval(timer);
    }, [getPairs]);

    return (
        <Grid container spacing={3} sx={{ p: 0 }}>
            <Grid item xs={12} md={12} lg={12} sx={{ pl: 0 }}>
                <PairsList token={token} pairs={pairs} />
            </Grid>
        </Grid>
    );
}
