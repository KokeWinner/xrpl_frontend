import axios from 'axios';
import { useState, useEffect } from 'react';

// Material
import { withStyles } from '@mui/styles';
import {
    alpha, styled, useTheme,
    CardHeader,
    Stack,
    Typography,
    Table,
    TableRow,
    TableBody,
    TableCell
} from '@mui/material';
import { tableCellClasses } from "@mui/material/TableCell";

// Utils
import { fIntNumber, fCurrency3, fNumber } from 'src/utils/formatNumber';

// ----------------------------------------------------------------------
import StackStyle from 'src/components/StackStyle';

const Label = withStyles({
    root: {
        color: alpha('#637381', 0.99)
    }
})(Typography);

const badge24hStyle = {
    display: 'inline-block',
    marginLeft: '4px',
    color: '#C4CDD5',
    fontSize: '11px',
    fontWeight: '500',
    lineHeight: '18px',
    backgroundColor: '#323546',
    borderRadius: '4px',
    padding: '2px 4px'
};
// ----------------------------------------------------------------------

export default function RichStatistics({token}) {
    const theme = useTheme();
    const BASE_URL = process.env.API_URL;

    const [richInfo, setRichInfo] = useState({time:Date.now(), length:0, top10:0, top20:0, top50:0, top100:0, active24H:0});

    useEffect(() => {
        function getRichInfo() {
            // https://api.xrpl.to/api/richinfo/0413ca7cfc258dfaf698c02fe304e607
            axios.get(`${BASE_URL}/richinfo/${token.md5}`)
                .then(res => {
                    let ret = res.status === 200 ? res.data : undefined;
                    if (ret) {
                        setRichInfo(ret.richInfo);
                    }
                }).catch(err => {
                    console.log("Error on getting richInfo!", err);
                }).then(function () {
                    // always executed
                });
        }
        getRichInfo();
    }, []);
   
    return (
        <StackStyle>
            <CardHeader title={`${token.name} Holders Statistics`}  subheader='' sx={{p:2}}/>
            <Table sx={{
                [`& .${tableCellClasses.root}`]: {
                    borderBottom: "1px solid",
                    borderBottomColor: theme.palette.divider
                }
            }}>
                <TableBody>
                    <TableRow>
                        <TableCell align="left"><Label variant="subtitle2" noWrap >Total Addresses</Label></TableCell>
                        <TableCell align="left">{fIntNumber(richInfo.length)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="left"><Label variant="subtitle1" noWrap >Active Addresses<span style={badge24hStyle}>24h</span></Label></TableCell>
                        <TableCell align="left">{fIntNumber(richInfo.active24H)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="left"><Label variant="subtitle1" noWrap >Top 10 Holders</Label></TableCell>
                        <TableCell align="left">{richInfo.top10.toFixed(2)}%</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="left"><Label variant="subtitle1" noWrap >Top 20 Holders</Label></TableCell>
                        <TableCell align="left">{richInfo.top20.toFixed(2)}%</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="left"><Label variant="subtitle1" noWrap >Top 50 Holders</Label></TableCell>
                        <TableCell align="left">{richInfo.top50.toFixed(2)}%</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="left"><Label variant="subtitle1" noWrap >Top 100 Holders</Label></TableCell>
                        <TableCell align="left">{richInfo.top100.toFixed(2)}%</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </StackStyle>
    );
}
