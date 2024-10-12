// Material
import { withStyles } from '@mui/styles';
import {
    TableRow,
    TableCell,
    TableHead,
} from '@mui/material';
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';
// ----------------------------------------------------------------------

const StickyTableCell = withStyles((theme) => ({
    head: {
        position: "sticky",
        //zIndex: 1000,
        top: 0
    }
})) (TableCell);

const TABLE_HEAD = [
    { no: 0, id: 'id',            label: '#',                  align: 'left', width: '' },
    { no: 1, id: 'name',          label: 'Name',               align: 'left', width: '20%'},
    { no: 2, id: 'exch',          label: 'Price',              align: 'right', width: '20%'},
    { no: 3, id: 'pro24h',        label: '24h (%)',            align: 'right', width: '20%'},
    //{ no: 4, id: 'pro7d',         label: '7d (%)',             align: 'right', width: '6%'},
    { no: 5, id: 'vol24hxrp',     label: 'Volume(24h)',        align: 'right', width: '20%'},
    //{ no: 6, id: 'vol24htx',      label: 'Trades',             align: 'right', width: '6%'},
    //{ no: 7, id: 'marketcap',     label: 'Market Cap',         align: 'right', width: '10%'},
    //{ no: 8, id: 'trustlines',    label: 'TrustLines',         align: 'right', width: '10%'},
    //{ no: 9, id: 'supply',        label: 'Circulating Supply', align: 'right', width: '13%'},
    //{ no: 10, id: 'historyGraph', label: 'Last 7 Days',        align: 'right', width: '13%'},
    //{ no: 10, id: 'added', label: 'Added',        align: 'right', width: '13%'},
    { id: '' }
];

export default function GainersLosersTokenListHead({ scrollLeft, tokens }) {
    const { darkMode } = useContext(AppContext);

    return (
        <TableHead sx={{
            '& .MuiTableCell-root:nth-of-type(1)': {
                position: "sticky",
                //zIndex: 1001,
                left: 0,
                background: darkMode ? "#000000" : '#FFFFFF'
            },
            '& .MuiTableCell-root:nth-of-type(2)': {
                position: "sticky",
                //zIndex: 1002,
                left: tokens.length > 0 ? 67 : 40,
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
