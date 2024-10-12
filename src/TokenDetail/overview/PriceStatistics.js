import Decimal from 'decimal.js';
// Material
import {
  alpha,
  styled,
  useTheme,
  CardHeader,
  Stack,
  Typography,
  Table,
  TableRow,
  TableBody,
  TableCell
} from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';

// Components
import BearBullLabel from './BearBullLabel';

// Redux
import { useSelector /*, useDispatch*/ } from 'react-redux';
import { selectMetrics } from 'src/redux/statusSlice';

// Utils
import { fNumber, fNumberWithCurreny } from 'src/utils/formatNumber';

import NumberTooltip from 'src/components/NumberTooltip';

// ----------------------------------------------------------------------
import StackStyle from 'src/components/StackStyle';
import { currencySymbols } from 'src/utils/constants';
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

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

export default function PriceStatistics({ token }) {
  const theme = useTheme();
  const metrics = useSelector(selectMetrics);
  const { activeFiatCurrency } = useContext(AppContext);

  const {
    id,
    name,
    amount,
    exch,
    maxMin24h,
    pro24h,
    p24h,
    vol24h,
    vol24hxrp,
    vol24hx,
    marketcap,
    dom
    /*
        pro7d,
        p7d,
        holders,
        offers,
        issuer,
        currency,
        date,
        trustlines,*/
  } = token;

  let user = token.user;
  if (!user) user = name;

  const voldivmarket =
    marketcap > 0 ? Decimal.div(vol24hxrp, marketcap).toNumber() : 0; // .toFixed(5, Decimal.ROUND_DOWN)
  const convertedMarketCap = Decimal.div(
    marketcap,
    metrics[activeFiatCurrency]
  ).toNumber(); // .toFixed(5, Decimal.ROUND_DOWN)

  let strPc24h = fNumber(p24h < 0 ? -p24h : p24h);
  let strPc24hPrep =
    (p24h < 0 ? '-' : '') + currencySymbols[activeFiatCurrency];
  return (
    <StackStyle>
      <CardHeader
        title={`${name} Price Statistics`}
        subheader=""
        sx={{ p: 2 }}
      />
      <Table
        sx={{
          [`& .${tableCellClasses.root}`]: {
            borderBottom: '1px solid',
            borderBottomColor: theme.palette.divider
          }
        }}
      >
        <TableBody>
          <TableRow>
            <TableCell align="left" sx={{ pr: 0 }}>
              <Typography variant="label1" noWrap>
                {user} Price Today
              </Typography>
            </TableCell>
            <TableCell align="left"></TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left" sx={{ pr: 0 }}>
              <Typography variant="label1" noWrap>
                {user} Price
              </Typography>
            </TableCell>
            <TableCell align="left">
              <NumberTooltip
                prepend={currencySymbols[activeFiatCurrency]}
                number={fNumberWithCurreny(exch, metrics[activeFiatCurrency])}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left" sx={{ pr: 0 }}>
              <Typography variant="label1" noWrap>
                Price Change<span style={badge24hStyle}>24h</span>
              </Typography>
            </TableCell>
            <TableCell align="left">
              <Stack>
                <NumberTooltip prepend={strPc24hPrep} number={fNumberWithCurreny(Number(strPc24h), metrics[activeFiatCurrency])} />
                <BearBullLabel value={pro24h} variant="small" />
              </Stack>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left" sx={{ pr: 0 }}>
              <Typography variant="label1" noWrap>
                24h Low / 24h High
              </Typography>
            </TableCell>
            <TableCell align="left">
              <NumberTooltip
                prepend={currencySymbols[activeFiatCurrency]}
                number={fNumber(
                  Decimal.mul(
                    Decimal.mul(maxMin24h[1], metrics.USD),
                    1 / metrics[activeFiatCurrency]
                  )
                )}
              />{' '}
              /{' '}
              <NumberTooltip
                prepend={currencySymbols[activeFiatCurrency]}
                // number={fNumber(
                //   activeFiatCurrency === 'USD'
                //     ? maxMin24h[1]
                //     : Decimal.mul(
                //         Decimal.div(maxMin24h[0], metrics.USD),
                //         1 / metrics[activeFiatCurrency]
                //       )
                // )}
                number={fNumber(
                  Decimal.mul(
                    Decimal.mul(maxMin24h[0], metrics.USD),
                    1 / metrics[activeFiatCurrency]
                  )
                )}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left" sx={{ pr: 0 }}>
              <Typography variant="label1" noWrap>
                Trading Volume<span style={badge24hStyle}>24h</span>
              </Typography>
            </TableCell>
            <TableCell align="left">
              {currencySymbols[activeFiatCurrency]}
              {fNumber(vol24hxrp / metrics[activeFiatCurrency])}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left" sx={{ pr: 0 }}>
              <Typography variant="label1" noWrap>
                Volume / Market Cap
              </Typography>
            </TableCell>
            <TableCell align="left">
              <NumberTooltip number={fNumber(voldivmarket)} />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left" sx={{ pr: 0 }}>
              <Typography variant="label1" noWrap>
                Market Dominance
              </Typography>
            </TableCell>
            <TableCell align="left">
              <NumberTooltip number={fNumber(dom || 0)} /> %
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left" sx={{ pr: 0 }}>
              <Typography variant="label1" noWrap>
                Market Rank
              </Typography>
            </TableCell>
            <TableCell align="left">{'#' + (Number(id) - 1)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left" sx={{ pr: 0 }}>
              <Typography variant="label1" noWrap>
                Market Cap
              </Typography>
            </TableCell>
            <TableCell align="left">
              {currencySymbols[activeFiatCurrency]}{' '}
              {fNumber(convertedMarketCap)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left" sx={{ pr: 0 }}>
              <Typography variant="label1" noWrap>
                Diluted Market Cap
              </Typography>
            </TableCell>
            <TableCell align="left">
              {currencySymbols[activeFiatCurrency]}{' '}
              {fNumber(amount * (exch / metrics[activeFiatCurrency]))}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </StackStyle>
  );
}
