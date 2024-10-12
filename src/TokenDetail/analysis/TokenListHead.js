import { visuallyHidden } from '@mui/utils';
import { withStyles } from '@mui/styles';
import {
    useMediaQuery,
    useTheme,
    Box,
    TableRow,
    TableCell,
    TableHead,
    TableSortLabel,
    Tooltip // Import Tooltip component
} from '@mui/material';
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';
import InfoIcon from '@mui/icons-material/Info'; // Import InfoIcon from Material-UI Icons
import { Typography } from '@material-ui/core';

const SmallInfoIcon = (props) => (
    <InfoIcon {...props} fontSize="smaller" /> // Make the icon smaller by setting fontSize="small"
);

const StickyTableCell = withStyles((theme) => ({
    head: {
        position: 'sticky',
        //zIndex: 1000,
        top: 0
    }
}))(TableCell);

const TABLE_HEAD = [
    { no: 0, id: 'id', label: '#', align: 'left', width: '' },
    { no: 1, id: 'name', label: 'Name', align: 'left', width: '20%' },
    { no: 2, id: 'exch', label: 'Price', align: 'right', width: '8%' },
    { no: 3, id: 'pro24h', label: '24h', align: 'right', width: '6%' },
    { no: 4, id: 'pro7d', label: '7d', align: 'right', width: '6%' },


    {
        no: 5,
        id: 'vol24hxrp',
        label: (
            <Tooltip
                title="Amount of XRP that has been traded with this token in the last 24 hours"
                placement="top"
            >
                <span>Volume <SmallInfoIcon /></span>
            </Tooltip>
        ),
        align: 'right',
        width: '10%'
    },
    {
        no: 6,
        id: 'vol24htx',
        label: (
            <Tooltip
                title="Trades represents the total number of trade transactions for an asset on the XRPL DEX within the last 24 hours, indicating market activity and liquidity."
                placement="top"
            >
                <span>Trades <SmallInfoIcon /></span>
            </Tooltip>
        ),
        align: 'right',
        width: '6%'
    },
    {
        no: 7,
        id: 'marketcap',
        label: (
            <Tooltip
                title="Circulating supply * price"
                placement="top"
            >
                <span>Market Cap <SmallInfoIcon /></span>
            </Tooltip>
        ),
        align: 'right',
        width: '10%'
    },
    {
        no: 8,
        id: 'trustlines',
        label: (
            <Tooltip
                title="A TrustLine in blockchain allows users to hold and transact in others' debt in specified currencies, enabling multi-currency dealings."
                placement="top"
            >
                <span>TrustLines <SmallInfoIcon /></span>
            </Tooltip>
        ),
        align: 'right',
        width: '10%'
    },
    {
        no: 9,
        id: 'supply',
        label: (
            <Tooltip
                title="The quantity of tokens in circulation within the market and held by the public is comparable to the shares in motion within the stock market."
                placement="top"
            >
                <span>Circulating Supply <SmallInfoIcon /></span>
            </Tooltip>
        ),
        align: 'right',
        width: '13%'
    },
    { no: 10, id: 'historyGraph', label: 'Last 7 Days', align: 'right', width: '13%' },
    { id: '' }
];

export default function TokenListHead({ scrollLeft, tokens }) {
    console.log("spotlight---->", scrollLeft)
    const { darkMode } = useContext(AppContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <TableHead sx={{
            '& .MuiTableCell-root:nth-of-type(1)': {
                position: "sticky",
                zIndex: 1001,
                left: 0,
                background: darkMode ? "#000000" : '#FFFFFF'
            },
            '& .MuiTableCell-root:nth-of-type(2)': {
                position: "sticky",
                zIndex: 1002,
                left: tokens.length > 0 ? 55 : 40,
                background: darkMode ? "#000000" : '#FFFFFF',
                '&:before': (scrollLeft ? {
                    content: "''",
                    boxShadow: "inset 10px 0 8px -8px #00000026",
                    position: "absolute",
                    top: "0",
                    right: "0",
                    bottom: "-1px",
                    width: "30px",
                    transform: "translate(100%)",
                    transition: "box-shadow .3s",
                    pointerEvents: "none",
                } : {})
            },
        }}>
            <TableRow>
                {TABLE_HEAD.map((headCell) => (
                    <StickyTableCell
                        key={headCell.id}
                        align={headCell.align}
                        sortDirection={false}
                        width={headCell.width}
                        sx={{
                            ...(headCell.no > 0 && {
                                // pl:0,
                                // pr:0,
                            })
                        }}
                    >
                        {headCell.label}
                    </StickyTableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}
