import {
    useTheme,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Stack,
} from '@mui/material';
import { Client } from "xrpl";
import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'src/AppContext';
import HistoryRow from './HistoryRow';
import { PulseLoader } from 'react-spinners';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const rippleServerUrl = process.env.NEXT_PUBLIC_RIPPLED_LIVE_DATA_ONLY_URL;
const client = new Client(rippleServerUrl);

const DeFiHistory = ({ account }) => {

    const theme = useTheme();
    const { darkMode } = useContext(AppContext);
    const [activityHistory, setActivityHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        accountHistory();
    }, [account])

    const accountHistory = async () => {
        if (account === undefined) return;
        setLoading(true);
        try {
            await client.connect();
            const transaction = {
                command: "account_tx",
                account: account,
                ledger_index_min: -1,
                ledger_index_max: -1,
                binary: false,
                // limit: 5,
                forward: false
            };
            const response = await client.request(transaction);
            const totalTransactions = response.result.transactions;
            const filteredTransactions = totalTransactions.filter((item) => {
                const transactionType = item.tx.TransactionType;
                const account = item.tx.Account;
                const destination = item.tx.Destination;
                const deliveredAmount = item.meta.delivered_amount;
                return (
                    (transactionType === "Payment" &&
                        account === destination &&
                        deliveredAmount !== undefined) ||
                    transactionType === "AMMDeposit" ||
                    transactionType === "AMMWithdraw"
                );
            });
            const updatedArray = filteredTransactions.map((item) => ({
                Account: item.tx.Account,
                Destination: item.tx.Destination,
                TransactionType: item.tx.TransactionType,
                Amount: item.tx.Amount,
                Amount2: item.tx.Amount2,
                Asset: item.tx.Asset,
                Asset2: item.tx.Asset2,
                TransactionResult: item.meta.TransactionResult,
                DeliveredAmount: item.meta.delivered_amount,
                SendMax: item.tx.SendMax,
                hash: item.tx.hash,
                date: item.tx.date
            }));

            for (let i = 0; i < updatedArray.length; i++) {
                const eachTransaction = updatedArray[i];
                if (typeof eachTransaction.Destination === "undefined") {
                    eachTransaction.Destination = "XRPL";
                }
            }
            const filteredData = updatedArray.filter((item) => {
                return item.Account === account || item.Destination === account;
            });
            setActivityHistory(filteredData);
        } catch (error) {
            console.log("The error is occurred in my transaction history", error);
        }
        setLoading(false);
    };


    return (
        <>
            {
                loading ? (
                    <Stack alignItems="center">
                        <PulseLoader color={darkMode ? '#007B55' : '#5569ff'} size={10} />
                    </Stack>
                ) : (
                    activityHistory && activityHistory.length === 0 &&
                    <Stack alignItems="center" sx={{ mt: 2, mb: 1 }}>
                        <ErrorOutlineIcon fontSize="small" sx={{ mr: '5px' }} />
                        <Typography variant="s6" color='primary'>[ No History ]</Typography>
                    </Stack>
                )
            }
            {
                activityHistory.length > 0 && (
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: theme.palette.text.primary }}>Type</TableCell>
                                <TableCell sx={{ color: theme.palette.text.primary }}>Amount</TableCell>
                                <TableCell sx={{ color: theme.palette.text.primary }}>Date</TableCell>
                                <TableCell sx={{ color: theme.palette.text.primary }}>View</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {activityHistory.map((item, index) => (
                                <HistoryRow key={index} {...item} />
                            ))}
                        </TableBody>
                    </Table>
                )
            }</>
    )
}

export default DeFiHistory;