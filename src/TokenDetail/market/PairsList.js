// Material
import {
    styled,
    Avatar,
    Box,
    IconButton,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';

// Iconify
import { Icon } from '@iconify/react';
import arrowsExchange from '@iconify/icons-gg/arrows-exchange';

// Utils
import { fNumber } from 'src/utils/formatNumber';
import { useEffect, useRef, useState } from 'react';
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// ----------------------------------------------------------------------
import StackStyle from 'src/components/StackStyle'; //Maybe need to disable?
import LoadChart from 'src/components/LoadChartPair';

// ----------------------------------------------------------------------


const badge24hStyle = {
    display: 'inline-block',
    marginLeft: '4px',
    marginRight: '4px',
   // color: '#C4CDD5',
    fontSize: '11px',
    fontWeight: '500',
    lineHeight: '18px',
    //backgroundColor: '#323546',
    borderRadius: '4px',
    border: '1px solid #323546',
    padding: '1px 4px'
};

const badgeDEXStyle = {
    display: 'inline-block',
    marginLeft: '4px',
    marginRight: '4px',
    //color: '#C4CDD5',
    fontSize: '11px',
    fontWeight: '500',
    lineHeight: '18px',
    // backgroundColor: '#7A0C2E',
    borderRadius: '4px',
    border: '1px solid #B78103',
    padding: '1px 4px'
};

function truncate(str, n){
    if (!str) return '';
    //return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
    return (str.length > n) ? str.substr(0, n-1) + ' ...' : str;
};

export default function PairsList({token, pairs}) {
    const BASE_URL = process.env.API_URL;
    const { darkMode } = useContext(AppContext);
    const { name, exch, pro7d, pro24h, md5 } = token;
    let user = token.user;
    if (!user) user = name;

    const tableRef = useRef(null);
    const [scrollLeft, setScrollLeft] = useState(0);
// Destructure slug from token here
const { slug } = token;
    useEffect(() => {
        const handleScroll = () => {
            setScrollLeft(tableRef?.current?.scrollLeft > 0);
        };

        tableRef?.current?.addEventListener('scroll', handleScroll);

        return () => {
            tableRef?.current?.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // const {
    //     issuer,
    //     currency,
    //     md5
    // } = token;
    // https://api.xrpl.to/api/pairs?md5=0413ca7cfc258dfaf698c02fe304e607
    return (
        <Stack>{/*<StackStyle>*/}
            <Typography variant="h5" sx={{ pl: 2, pt: 2 }}>Pairs<span style={badge24hStyle}>24h</span></Typography>
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
                <Table stickyHeader sx={{
                    "& .MuiTableCell-root": {
                        borderBottom: "none",
                        boxShadow: darkMode
                            ? "inset 0 -1px 0 rgba(68 67 67), inset 0 -1px 0 rgba(255, 255, 255, 0.1)"
                            : "inset 0 -1px 0 #dadee3",
                    }
                }}>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" sx={{
                                position: "sticky",
                                zIndex: 1001,
                                left: 0,
                                background: darkMode ? "#000000" : '#FFFFFF'
                            }}>#</TableCell>
                            <TableCell align="left" sx={{
                                position: "sticky",
                                zIndex: 1002,
                                left: 40,
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
                            }}>Pair</TableCell>
                            <TableCell align="left">Domain</TableCell>
                            <TableCell align="left">Last 7 Days</TableCell>
                            <TableCell align="left">Volume<span style={badge24hStyle}>24h</span></TableCell>
                            <TableCell align="left">Trades<span style={badge24hStyle}>24h</span></TableCell>
                            <TableCell align="left">Issuer</TableCell>
                            <TableCell align="left"><span style={badgeDEXStyle}>DEX</span></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        // exchs.slice(page * rows, page * rows + rows)
                        pairs.map((row) => {
                            const {
                                id,
                                pair,
                                curr1,
                                curr2,
                                count
                            } = row;
                            const name1 = curr1.name;
                            const name2 = curr2.name;

                            let user1 = curr1.user;
                            let user2 = curr2.user;
                            
                            if (!user1) user1 = curr1.issuer;
                            if (!user2) user2 = curr2.issuer;

                            user1 = truncate(user1, 12);
                            user2 = truncate(user2, 12);

                            // market=434F524500000000000000000000000000000000%2BrcoreNywaoz2ZCQ8Lg2EbSLnGuRBmun6D%2F534F4C4F00000000000000000000000000000000%2BrsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz
                            let soloDexURL = `https://sologenic.org/trade?network=mainnet&market=${curr1.currency}%2B${curr1.issuer}%2F${curr2.currency}`;
                            if (curr2.currency !== 'XRP')
                                soloDexURL += `%2B${curr2.issuer}`;

                            let gatehubDexURL = `https://gatehub.net/markets/${curr1.currency}+${curr1.issuer}/${curr2.currency}`;
                            if (curr2.currency !== 'XRP')
                                gatehubDexURL += `+${curr2.issuer}`;

                            // dex/SOLO-rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz/XRP
                            let xpmarketDexURL = `https://xpmarket.com/dex/${curr1.name}+${curr1.issuer}/${curr2.currency}`;
                            if (curr2.currency !== 'XRP')
                                xpmarketDexURL += `+${curr2.issuer}`;
                            // /dex/EUR+rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq_XRP+XRP
                            let magneticDexURL = `https://xmagnetic.org/dex/${curr1.name}+${curr1.issuer}_${curr2.currency}+${curr2.currency}`;
                            if (curr2.currency !== 'XRP')
                            magneticDexURL += `+${curr2.issuer}`;

                            let xummDexURL = `https://xumm.app/detect/xapp:xumm.dex?issuer=${curr1.issuer}&currency=${curr1.currency}`;

                            let unhostedDexURL = `https://unhosted.exchange/?base=${curr1.currency}_${curr1.issuer}&quote=XRP`;

                            let xrpltoDexURL = `/token/${slug}/trade`;

                            let sparkline = '';
                            if (id === 1)
                                sparkline = curr1.md5;
                            else if (curr2.issuer)
                                sparkline = curr2.md5;

                            
                            
                            return (
                                <TableRow
                                    key={pair}
                                    sx={{
                                        "&:hover": {
                                            "& .MuiTableCell-root": {
                                                backgroundColor: darkMode ? "#232326 !important" : "#D9DCE0 !important"
                                            }
                                        }
                                    }}
                                >
                                    <TableCell align="left" sx={{pt:0.5, pb:0.5,
                                        position: "sticky",
                                        zIndex: 1001,
                                        left: 0,
                                        background: darkMode ? "#000000" : '#FFFFFF'
                                    }}>
                                        {fNumber(id)}
                                    </TableCell>
                                    <TableCell align="left" sx={{pt:0.5, pb:0.5,
                                        position: "sticky",
                                        zIndex: 1003,
                                        left: 40,
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
                                    }}>
                                        <Stack direction="row" alignItems='center'>
                                            <Typography variant="subtitle2" sx={{ color: '#B72136' }}>{name1}</Typography>
                                            <Icon icon={arrowsExchange} width="16" height="16"/>
                                            <Typography variant="subtitle2" sx={{ color: darkMode ? '#007B55' : '#5569ff' }}>{name2}</Typography>

                                        </Stack>
                                    </TableCell>
                                    <TableCell align="left" sx={{p:0.5, pb:0.5}}>
                                        <Stack>
                                            {id === 1 && curr1.domain && (
                                                <Link
                                                    underline="none"
                                                    color="inherit"
                                                    target="_blank"
                                                    href={`https://${curr1.domain}`}
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                    <Typography variant="subtitle2" sx={{ color: '#B72136' }}>{curr1.domain}</Typography>
                                                </Link>
                                            )}
                                            {curr2.domain && (
                                                <Link
                                                    underline="none"
                                                    color="inherit"
                                                    target="_blank"
                                                    href={`https://${curr2.domain}`}
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                     {/* Couldn't find where this changes the color at - Yannier */}
                                                    <Typography variant="subtitle2" sx={{ color: darkMode ? '#5569ff' : '#007B55' }}>{curr2.domain}</Typography>

                                                </Link>
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="left" sx={{p:0.5, pb:0.5}}>
                                        {sparkline && (
                                            <LoadChart
                                                url={`${BASE_URL}/sparkline/${sparkline}`}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="left" sx={{p:0.5, pb:0.5}}>
                                        <Stack>
                                            <Stack direction="row" spacing={1} alignItems='center'>
                                                <Typography variant="subtitle2" sx={{ color: '#B72136' }}>{fNumber(curr1.value)}</Typography>
                                                <Typography variant="caption" sx={{ color: '#B72136' }}>{name1}</Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems='center'>
                                            <Typography variant="subtitle2" sx={{ color: darkMode ? '#007B55' : '#5569ff' }}>{fNumber(curr2.value)}</Typography>

                                                <Typography variant="caption" sx={{ color: darkMode ? '#007B55' : '#5569ff' }}>{name2}</Typography>

                                            </Stack>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="left" sx={{pt:0.5, pb:0.5}}>
                                        {fNumber(count)}
                                    </TableCell>
                                    <TableCell align="left" sx={{p:0.5, pb:0.5}}>
                                        <Stack>
                                            {id === 1 && (
                                                <Stack direction="row" alignItems='center'>
                                                    
                                                    <Link
                                                        underline="none"
                                                        color="inherit"
                                                        target="_blank"
                                                        href={`https://bithomp.com/explorer/${curr1.issuer}`}
                                                        rel="noreferrer noopener nofollow"
                                                    >
                                                        <Typography variant="subtitle2" sx={{ color: '#B72136' }}>{user1}</Typography>
                                                    </Link>
                                                </Stack>
                                            )}
                                            {curr2.issuer && curr2.issuer !== 'XRPL' && (
                                                <Stack direction="row" alignItems='center'>
                                                    

                                                    <Link
                                                        underline="none"
                                                        color="inherit"
                                                        target="_blank"
                                                        href={`https://bithomp.com/explorer/${curr2.issuer}`}
                                                        rel="noreferrer noopener nofollow"
                                                    >
                                                        <Typography variant="subtitle2" sx={{ color: darkMode ? '#007B55' : '#5569ff' }}>{user2}</Typography>
                                                    </Link>
                                                </Stack>
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="left" sx={{ pt:0.5, pb:0.5 }}>
                                        <Stack direction="row" spacing={1}>


                                        <Link
                                                underline="none"
                                                color="inherit"
                                            //    target="_blank"
                                                href={xrpltoDexURL}
                                                rel="noreferrer noopener nofollow"
                                            >
                                                <IconButton edge="end" aria-label="xrpl.to">
                                                    <Avatar alt="xrpl.to DEX" src={darkMode ? "/static/sponsor-dark-theme.svg" : "/static/sponsor-light-theme.svg"} sx={{ width: 24, height: 24 }} />
                                                    
                                                </IconButton>
                                            </Link>


                                            <Link
                                                underline="none"
                                                color="inherit"
                                                target="_blank"
                                                href={soloDexURL}
                                                rel="noreferrer noopener nofollow"
                                            >
                                                <IconButton edge="end" aria-label="solo">
                                                    <Avatar alt="Sologenic DEX" src="/static/solo.webp" sx={{ width: 24, height: 24 }} />
                                                </IconButton>
                                            </Link>

                                            <Link
                                                underline="none"
                                                color="inherit"
                                                target="_blank"
                                                href={xummDexURL}
                                                rel="noreferrer noopener nofollow"
                                            >
                                                <IconButton edge="end" aria-label="solo">
                                                    <Avatar alt="XUMM DEX" src="/static/xumm.webp" sx={{ width: 24, height: 24 }} />
                                                </IconButton>
                                            </Link>

                                            
                                            <Link
                                                underline="none"
                                                color="inherit"
                                                target="_blank"
                                                href={gatehubDexURL}
                                                rel="noreferrer noopener nofollow"
                                            >
                                                <IconButton edge="end" aria-label="solo">
                                                    <Avatar alt="Gatehub DEX" src="/static/gatehub.webp" sx={{ width: 24, height: 24 }} />
                                                </IconButton>
                                            </Link>
                                            

                                            <Link
                                                underline="none"
                                                color="inherit"
                                                target="_blank"
                                                href={xpmarketDexURL}
                                                rel="noreferrer noopener nofollow"
                                            >
                                                <IconButton edge="end" aria-label="solo">
                                                    <Avatar alt="xpmarket DEX" src="/static/xpmarket.webp" sx={{ width: 24, height: 24 }} />
                                                </IconButton>
                                            </Link>

                                            <Link
                                                underline="none"
                                                color="inherit"
                                                target="_blank"
                                                href={magneticDexURL}
                                                rel="noreferrer noopener nofollow"
                                            >
                                                <IconButton edge="end" aria-label="solo">
                                                    <Avatar alt="Magnetic DEX" src="/static/magnetic.webp" sx={{ width: 24, height: 24 }} />
                                                </IconButton>
                                            </Link>


                                            <Link
                                                underline="none"
                                                color="inherit"
                                                target="_blank"
                                                href={unhostedDexURL}
                                                rel="noreferrer noopener nofollow"
                                            >
                                                <IconButton edge="end" aria-label="solo">
                                                    <Avatar alt="Unhosted DEX" src="/static/unhosted-dex.webp" sx={{ width: 24, height: 24 }} />
                                                </IconButton>
                                            </Link>


                                            
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Box>
        </Stack>
    );
}
