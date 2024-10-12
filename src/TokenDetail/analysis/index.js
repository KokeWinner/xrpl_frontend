import axios from 'axios';
import { useState, useEffect, useContext, useRef } from 'react';
import { useSelector } from "react-redux";
import { styled, Box, Stack, Table, TableBody, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { PuffLoader } from "react-spinners";
import { AppContext } from 'src/AppContext';
import { selectMetrics } from "src/redux/statusSlice";
import TokenListHead from './TokenListHead';
import { TokenRow } from './TokenRow';
import TokenListToolbar from './TokenListToolbar';
import EditTokenDialog from 'src/components/EditTokenDialog';
import TrustSetDialog from 'src/components/TrustSetDialog';

const ConnectWalletContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '10vh'
});

const StyledTable = styled(Table)(({ theme }) => ({
    "& .MuiTableCell-root": {
        borderBottom: "none",
        boxShadow: theme.palette.mode === 'dark'
            ? "inset 0 -1px 0 rgba(68, 67, 67), inset 0 -1px 0 rgba(255, 255, 255, 0.1)"
            : "inset 0 -1px 0 #dadee3",
    }
}));

export default function AnalysisData({ token }) {
    const metrics = useSelector(selectMetrics);
    const BASE_URL = process.env.API_URL;
    const { accountProfile, darkMode, activeFiatCurrency } = useContext(AppContext);
    const isAdmin = accountProfile?.account && accountProfile.admin;

    const [page, setPage] = useState(0);
    const [rows, setRows] = useState(10);
    const [count, setCount] = useState(0);
    const [tokens, setTokens] = useState([]);
    const [editToken, setEditToken] = useState(null);
    const [trustToken, setTrustToken] = useState(null);
    const [loading, setLoading] = useState(false);

    const tableRef = useRef(null);

    useEffect(() => {
        async function getTokens() {
            setLoading(true);
            try {
                const response = await axios.get(`${BASE_URL}/other_tokens?md5=${token.md5}&issuer=${token.issuer}&page=${page}&limit=${rows}`);
                if (response.status === 200) {
                    const filteredTokens = response.data.tokens.filter(t => parseFloat(t.amount) !== 0);
                    setCount(filteredTokens.length);
                    setTokens(filteredTokens);
                }
            } catch (err) {
                console.error("Error on getting tokens!!!", err);
            } finally {
                setLoading(false);
            }
        }
        getTokens();
    }, [BASE_URL, token.md5, token.issuer, page, rows]);

    const [scrollLeft, setScrollLeft] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollLeft(tableRef.current?.scrollLeft > 0);
        };

        const refCurrent = tableRef.current;
        refCurrent?.addEventListener('scroll', handleScroll);

        return () => {
            refCurrent?.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            {editToken && <EditTokenDialog token={editToken} setToken={setEditToken} />}
            {trustToken && <TrustSetDialog token={trustToken} setToken={setTrustToken} />}
            <Typography variant="s2">Other tokens by this issuer</Typography>
            <Box
                sx={{
                    display: "flex",
                    gap: 1,
                    py: 1,
                    overflow: "auto",
                    width: "100%",
                    "& > *": {
                        scrollSnapAlign: "center",
                    },
                    "::-webkit-scrollbar": { display: "none" },
                }}
                ref={tableRef}
            >
                <StyledTable darkMode={darkMode}>
                    {count > 0 && <TokenListHead scrollLeft={scrollLeft} tokens={tokens} />}
                    <TableBody>
                        {tokens.map((row) => (
                            <TokenRow
                                key={`${row.currency}-${row.issuer}`}
                                token={row}
                                admin={isAdmin}
                                setEditToken={setEditToken}
                                setTrustToken={setTrustToken}
                                scrollLeft={scrollLeft}
                                activeFiatCurrency={activeFiatCurrency}
                                exchRate={metrics[activeFiatCurrency]}
                            />
                        ))}
                    </TableBody>
                </StyledTable>
            </Box>
            {count > 0 ? (
                <TokenListToolbar
                    count={count}
                    rows={rows}
                    setRows={setRows}
                    page={page}
                    setPage={setPage}
                />
            ) : loading ? (
                <Stack alignItems="center" sx={{ mt: 5, mb: 5 }}>
                    <PuffLoader color={"#00AB55"} size={35} />
                </Stack>
            ) : (
                <ConnectWalletContainer>
                    <Typography variant='subtitle2' color='error' sx={{ display: 'flex', alignItems: 'center' }}>
                        <ErrorOutlineIcon fontSize="small" sx={{ mr: '5px' }} />
                        No other tokens by this issuer
                    </Typography>
                </ConnectWalletContainer>
            )}
        </>
    );
}
