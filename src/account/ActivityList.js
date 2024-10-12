import axios from 'axios';
import { useState, useEffect } from 'react';

// Material
import {
    useTheme,
    Avatar,
    Box,
    Container,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography
} from '@mui/material';
import { tableCellClasses } from "@mui/material/TableCell";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import GridOnIcon from '@mui/icons-material/GridOn';
import Grid4x4Icon from '@mui/icons-material/Grid4x4';
import ApprovalIcon from '@mui/icons-material/Approval';
import TokenIcon from '@mui/icons-material/Token';
import CollectionsIcon from '@mui/icons-material/Collections';
import CasinoIcon from '@mui/icons-material/Casino';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import FireplaceIcon from '@mui/icons-material/Fireplace';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AnimationIcon from '@mui/icons-material/Animation';
import PaymentIcon from '@mui/icons-material/Payment';
import ImportExportIcon from '@mui/icons-material/ImportExport';


// Context
import { useContext } from 'react'
import { AppContext } from 'src/AppContext'

// Utils
import { formatDateTime } from 'src/utils/formatTime';
import { Activity } from 'src/utils/extra';
import { normalizeAmount } from 'src/utils/normalizers';

// Loader
import { PulseLoader } from "react-spinners";

// Components
import ListToolbar from './ListToolbar';
// ----------------------------------------------------------------------
export default function ActivityList({account}) {
    const theme = useTheme();
    const BASE_URL = process.env.API_URL;

    const [page, setPage] = useState(0);
    const [rows, setRows] = useState(10);
    const [total, setTotal] = useState(0);
    const [acts, setActs] = useState([]);
    const { darkMode } = useContext(AppContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        function getActivities() {
            setLoading(true);
            axios.get(`${BASE_URL}/account/activity?account=${account}&page=${page}&limit=${rows}`)
                .then(res => {
                    let ret = res.status === 200 ? res.data : undefined;
                    if (ret) {
                        setTotal(ret.total);
                        setActs(ret.acts);
                    }
                }).catch(err => {
                    console.log("Error on getting activity list!!!", err);
                }).then(function () {
                    // always executed
                    setLoading(false);
                });
        }
        getActivities();
    }, [account, page, rows]);

    return (
        <Container maxWidth="xl" sx={{pl: 0, pr: 0}}>
            {loading ? (
                <Stack alignItems="center">
                    <PulseLoader color={darkMode ? '#007B55' : '#5569ff'} size={10} />
                </Stack>
            ):(
                acts && acts.length === 0 &&
                    <Stack alignItems="center" sx={{mt: 5}}>
                        <Typography variant="s7">No Items</Typography>
                    </Stack>
            )
            }
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
            >
                <Table stickyHeader sx={{
                    [`& .${tableCellClasses.root}`]: {
                        borderBottom: "1px solid",
                        borderColor: theme.palette.divider
                    }
                }}>
                    <TableBody>
                    {
                        acts && acts.map((row) => {
                            const {
                                account,
                                activity,
                                data,
                                time
                            } = row;

                            const strDateTime = formatDateTime(time);

                            let strActivity = '';
                            let componentActivity = (<></>);
                            let componentIcon = (<TaskAltIcon />);
                            switch (activity) {
                                case Activity.LOGIN:
                                    strActivity = 'Login';
                                    componentIcon = (<LoginIcon />);
                                    componentActivity = (
                                        <>
                                        </>
                                    );
                                    break;
                                case Activity.LOGOUT:
                                    strActivity = 'Logout';
                                    componentIcon = (<LogoutIcon />);
                                    componentActivity = (
                                        <>
                                        </>
                                    );
                                    break;
                                case Activity.UPDATE_PROFILE:
                                    strActivity = 'Update Profile';
                                    componentIcon = (<ManageAccountsIcon />);
                                    componentActivity = (
                                        <>
                                        </>
                                    );
                                    break;
                                case Activity.CREATE_SELL_OFFER:
                                    componentIcon = (<LocalOfferIcon />);
                                    strActivity = 'Create Sell Offer';
                                    // NFTokenID
                                    componentActivity = (
                                        <>
                                            <Stack direction="row" spacing={1}>
                                                <Typography variant="s7">NFTokenID: </Typography>
                                                <Link
                                                    color="inherit"
                                                    target="_blank"
                                                    href={`/nft/${data.NFTokenID}`}
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                    <Typography variant="s8">{data.NFTokenID}</Typography>
                                                </Link>
                                            </Stack>
                                        </>
                                    );
                                    break;
                                case Activity.CREATE_BUY_OFFER:
                                    componentIcon = (<LocalOfferIcon />);
                                    strActivity = 'Create Buy Offer';
                                    // NFTokenID
                                    componentActivity = (
                                        <>
                                            <Stack direction="row" spacing={1}>
                                                <Typography variant="s7">NFTokenID: </Typography>
                                                <Link
                                                    color="inherit"
                                                    target="_blank"
                                                    href={`/nft/${data.NFTokenID}`}
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                    <Typography variant="s8">{data.NFTokenID}</Typography>
                                                </Link>
                                            </Stack>
                                        </>
                                    );
                                    break;

                                case Activity.CANCEL_SELL_OFFER:
                                    componentIcon = (<HighlightOffIcon />);
                                    strActivity = 'Cancel Sell Offer';
                                    // NFTokenID
                                    componentActivity = (
                                        <>
                                            <Stack direction="row" spacing={1}>
                                                <Typography variant="s7">NFTokenID: </Typography>
                                                <Link
                                                    color="inherit"
                                                    target="_blank"
                                                    href={`https://bithomp.com/explorer/${data.NFTokenID}`}
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                    <Typography variant="s8">{data.NFTokenID}</Typography>
                                                </Link>
                                            </Stack>
                                        </>
                                    );
                                    break;
                                case Activity.CANCEL_BUY_OFFER:
                                    componentIcon = (<HighlightOffIcon />);
                                    strActivity = 'Cancel Buy Offer';
                                    // NFTokenID
                                    componentActivity = (
                                        <>
                                            <Stack direction="row" spacing={1}>
                                                <Typography variant="s7">NFTokenID: </Typography>
                                                <Link
                                                    color="inherit"
                                                    target="_blank"
                                                    href={`https://bithomp.com/explorer/${data.NFTokenID}`}
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                    <Typography variant="s8">{data.NFTokenID}</Typography>
                                                </Link>
                                            </Stack>
                                        </>
                                    );
                                    break;

                                case Activity.ACCEPT_BUY_OFFER:
                                    componentIcon = (<CheckCircleOutlineIcon />);
                                    strActivity = 'Accept Buy Offer';
                                    // NFTokenID
                                    componentActivity = (
                                        <>
                                            <Stack direction="row" spacing={1}>
                                                <Typography variant="s7">NFTokenID: </Typography>
                                                <Link
                                                    color="inherit"
                                                    target="_blank"
                                                    href={`https://bithomp.com/explorer/${data.NFTokenID}`}
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                    <Typography variant="s8">{data.NFTokenID}</Typography>
                                                </Link>
                                            </Stack>
                                        </>
                                    );
                                    break;
                                case Activity.ACCEPT_SELL_OFFER:
                                    componentIcon = (<CheckCircleOutlineIcon />);
                                    strActivity = 'Accept Sell Offer';
                                    // NFTokenID
                                    componentActivity = (
                                        <>
                                            <Stack direction="row" spacing={1}>
                                                <Typography variant="s7">NFTokenID: </Typography>
                                                <Link
                                                    color="inherit"
                                                    target="_blank"
                                                    href={`https://bithomp.com/explorer/${data.NFTokenID}`}
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                    <Typography variant="s8">{data.NFTokenID}</Typography>
                                                </Link>
                                            </Stack>
                                        </>
                                    );
                                    break;

                                case Activity.OWNER_ACCPETED_YOUR_BUY_OFFER:
                                    componentIcon = (<HowToRegIcon />);
                                    strActivity = 'NFT Owner accepted your Buy Offer';
                                    // NFTokenID
                                    componentActivity = (
                                        <>
                                            <Stack direction="row" spacing={1}>
                                                <Typography variant="s7">NFTokenID: </Typography>
                                                <Link
                                                    color="inherit"
                                                    target="_blank"
                                                    href={`https://bithomp.com/explorer/${data.NFTokenID}`}
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                    <Typography variant="s8">{data.NFTokenID}</Typography>
                                                </Link>
                                            </Stack>
                                        </>
                                    );
                                    break;
                                case Activity.BUYER_ACCEPTED_YOUR_SELL_OFFER:
                                    componentIcon = (<HowToRegIcon />);
                                    strActivity = 'Buyer accepted your Sell Offer';
                                    // NFTokenID
                                    componentActivity = (
                                        <>
                                            <Stack direction="row" spacing={1}>
                                                <Typography variant="s7">NFTokenID: </Typography>
                                                <Link
                                                    color="inherit"
                                                    target="_blank"
                                                    href={`https://bithomp.com/explorer/${data.NFTokenID}`}
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                    <Typography variant="s8">{data.NFTokenID}</Typography>
                                                </Link>
                                            </Stack>
                                        </>
                                    );
                                    break;

                                case Activity.YOU_RECEIVED_A_NFT:
                                    componentIcon = (<SportsScoreIcon />);
                                    strActivity = 'You received an NFT';
                                    // NFTokenID
                                    componentActivity = (
                                        <>
                                            <Stack direction="row" spacing={1}>
                                                <Typography variant="s7">NFTokenID: </Typography>
                                                <Link
                                                    color="inherit"
                                                    target="_blank"
                                                    href={`https://bithomp.com/explorer/${data.NFTokenID}`}
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                    <Typography variant="s8">{data.NFTokenID}</Typography>
                                                </Link>
                                            </Stack>
                                        </>
                                    );
                                    break;

                                default:
                                    strActivity = `Unknown Activity: ${activity}`;
                                    componentIcon = (<HelpOutlineIcon />);
                                    componentActivity = (
                                        <>
                                            <Stack direction="row" spacing={1}>

                                            </Stack>
                                        </>
                                    );
                                    break;
                            }

                            return (
                                <TableRow
                                    // hover
                                    key={time}
                                    sx={{
                                        [`& .${tableCellClasses.root}`]: {
                                            // color: (error ? '#B72136' : '#B72136')
                                        }
                                    }}
                                >
                                    {/* <TableCell align="left"><Typography variant="subtitle2">{id}</Typography></TableCell> */}
                                    <TableCell align="left">
                                        {componentIcon}
                                    </TableCell>

                                    <TableCell align="left">
                                        <Stack spacing={0.5}>
                                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                                <Typography variant="s8">{strActivity}</Typography>
                                                <Typography variant="s7">{strDateTime}</Typography>
                                            </Stack>
                                            {componentActivity}
                                            {/* <Link
                                                color="inherit"
                                                target="_blank"
                                                href={`https://bithomp.com/explorer/${account}`}
                                                rel="noreferrer noopener nofollow"
                                            >
                                                <Typography variant="s4" color="#33C2FF">{account}</Typography>
                                            </Link> */}
                                        </Stack>
                                    </TableCell>

                                    <TableCell align="left">

                                    </TableCell>
                                </TableRow>
                            );
                        })
                    }
                    </TableBody>
                </Table>
            </Box>
            { total > 0 &&
                <ListToolbar
                    count={total}
                    rows={rows}
                    setRows={setRows}
                    page={page}
                    setPage={setPage}
                />
            }
        </Container>
    );
}
