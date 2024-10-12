import axios from 'axios';
import { useState, useEffect, useContext } from 'react';

// Material
import {
    useTheme,
    Box,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
    Paper,
    Chip
} from '@mui/material';
import { tableCellClasses } from "@mui/material/TableCell";

// Loader
import { PulseLoader } from "react-spinners";

// Context
import { AppContext } from 'src/AppContext';

// Utils
import { normalizeCurrencyCodeXummImpl } from "src/utils/normalizers";

function truncate(str, n) {
    if (!str) return '';
    return (str.length > n) ? str.substr(0, n-1) + ' ...' : str;
};

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/New_York',
        timeZoneName: 'short'
    };
    return date.toLocaleString('en-US', options);
}

function formatAmount(amount) {
    return parseFloat(amount).toFixed(1);
}

export default function HistoryList({ nft }) {
    const theme = useTheme();
    const BASE_URL = 'https://api.xrpnft.com/api';
    const { accountProfile, sync } = useContext(AppContext);
    const [hists, setHists] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        function getHistories() {
            setLoading(true);
            axios.get(`${BASE_URL}/history/${nft.NFTokenID}`)
                .then(res => {
                    let ret = res.status === 200 ? res.data : undefined;
                    if (ret) {
                        setHists(ret.histories);
                    }
                    setLoading(false);
                }).catch(err => {
                    console.error("Error on getting nft history list!!!", err);
                    setLoading(false);
                });
        }
        getHistories();
    }, [sync]);

    return (
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {loading ? (
                <Stack alignItems="center" justifyContent="center" height={200}>
                    <PulseLoader color={theme.palette.primary.main} size={10} />
                </Stack>
            ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table stickyHeader sx={{
                        [`& .${tableCellClasses.root}`]: {
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        }
                    }}>
                        <TableBody>
                            {hists && hists.slice().reverse().map((row) => (
                                <TableRow key={row.uuid} hover>
                                    <TableCell align="left" sx={{ py: 2 }}>
                                        <Chip
                                            label={row.type}
                                            color={row.type === 'SALE' ? 'success' : 'primary'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="left" sx={{ py: 2 }}>
                                        <Link href={`/account/${row.account}`} underline="hover">
                                            <Typography variant='body2' noWrap>{truncate(row.account, 16)}</Typography>
                                        </Link>
                                    </TableCell>
                                    <TableCell align="left" sx={{ py: 2 }}>
                                        {row.type === 'SALE' ? (
                                            <Typography variant='body2' fontWeight="bold">
                                                {formatAmount(row.cost.amount)} {normalizeCurrencyCodeXummImpl(row.cost.currency)}
                                            </Typography>
                                        ) : (
                                            <Typography variant='body2' color="text.secondary">- - -</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="left" sx={{ py: 2 }}>
                                        <Typography variant='body2' color="text.secondary">{formatDateTime(row.time)}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            )}
        </Paper>
    );
}
