import axios from 'axios';
import Decimal from 'decimal.js';
import { useState, useEffect, useCallback, useMemo } from 'react';

// Material
import {
    useTheme,
    Typography,
    Button,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@mui/material';
import { tableCellClasses } from "@mui/material/TableCell";

// Context
import { useContext } from 'react'
import { AppContext } from 'src/AppContext'

// Utils

// Components

export default function AccountBalance({pair, accountPairBalance, setAccountPairBalance}) {
    const theme = useTheme();
    const BASE_URL = process.env.API_URL;
    const { accountProfile, sync, darkMode } = useContext(AppContext);
    const curr1 = useMemo(() => pair.curr1, [pair]);
    const curr2 = useMemo(() => pair.curr2, [pair]);

    const getAccountInfo = useCallback(() => {
        if (!accountProfile?.account || !pair) {
            setAccountPairBalance(null);
            return;
        }

        const account = accountProfile.account;
        axios.get(`${BASE_URL}/account/info/${account}?curr1=${curr1.currency}&issuer1=${curr1.issuer}&curr2=${curr2.currency}&issuer2=${curr2.issuer}`)
            .then(res => {
                if (res.status === 200) {
                    setAccountPairBalance(res.data.pair);
                }
            }).catch(err => {
                console.error("Error on getting account pair balance info.", err);
            });
    }, [accountProfile, pair, curr1, curr2, BASE_URL, setAccountPairBalance]);

    useEffect(() => {
        getAccountInfo();
    }, [getAccountInfo, sync]);

    return (
        <>
            {accountPairBalance ? (
                <Table size={'small'}
                    sx={{
                        [`& .${tableCellClasses.root}`]: {
                            borderBottom: "0px solid",
                            borderBottomColor: theme.palette.divider
                        }
                    }}
                >
                    <TableBody>
                        <TableRow
                            key={-1}
                        >
                            <TableCell align="center" sx={{ p:0 }}>
                                <Typography variant="subtitle2" sx={{ color: '#B72136' }}>{curr1.name}</Typography>
                                {new Decimal(accountPairBalance.curr1.value).toFixed(8, Decimal.ROUND_DOWN)}
                            </TableCell>
                            <TableCell align="center" sx={{ p:0 }}>
                            <Typography variant="subtitle2" sx={{ color: darkMode ? '#007B55' : '#5569ff' }}>{curr2.name}</Typography>
                                {new Decimal(accountPairBalance.curr2.value).toFixed(6, Decimal.ROUND_DOWN)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            ):(
                <Stack sx={{mt:2}} />
            )}
        </>
    );
}
