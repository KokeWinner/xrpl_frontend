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

const SmallInfoIcon = (props) => (
  <InfoIcon {...props} fontSize="smaller" /> // Make the icon smaller by setting fontSize="small"
);

const StickyTableCell = withStyles((theme) => ({
  head: {
    position: 'sticky',
    zIndex: 1000,
    top: 0
  }
}))(TableCell);

const TABLE_HEAD = [
  { no: 0, id: 'star', label: '', align: 'left', width: '', order: false },
  { no: 1, id: 'id', label: '#', align: 'left', width: '', order: false },
  {
    no: 2,
    id: 'name',
    label: 'Name',
    align: 'left',
    width: '11%',
    order: true
  },
  {
    no: 3,
    id: 'exch',
    label: 'Price',
    align: 'right',
    width: '8%',
    order: true
  },
  {
    no: 4,
    id: 'pro24h',
    label: '24h',
    align: 'right',
    width: '6%',
    order: true
  },
  {
    no: 5,
    id: 'pro7d',
    label: '7d',
    align: 'right',
    width: '6%',
    order: true
  },
  {
    no: 6,
    id: 'vol24hxrp',
    label: (
     <Tooltip
        title="Amount of XRP that has been traded with this token in the last 24 hours"
        placement="top" // Adjust placement as needed
      >
        <span>
          Volume <SmallInfoIcon /> {/* Use the SmallInfoIcon component */}
        </span>
     </Tooltip>
    ),
    align: 'right',
    width: '10%',
    order: true
  },
  {
    no: 7,
    id: 'vol24htx',
    label: (
      <Tooltip
         title="Trades represents the total number of trade transactions for an asset on the XRPL DEX within the last 24 hours, indicating market activity and liquidity."
         placement="top" // Adjust placement as needed
       >
         <span>
           Trades <SmallInfoIcon /> {/* Use the SmallInfoIcon component */}
         </span>
      </Tooltip>
     ),
    align: 'right',
    width: '6%',
    order: true
  },
  {
    no: 8,
    id: 'marketcap',
    label: (
      <Tooltip
        title="Circulating supply * price"
        placement="top" // Adjust placement as needed
      >
        <span>
          Market Cap <SmallInfoIcon /> {/* Use the SmallInfoIcon component */}
        </span>
      </Tooltip>
    ),
    align: 'right',
    width: '10%',
    order: true
  },
  {
    no: 9,
    id: 'trustlines',
    label: (
      <Tooltip
         title="A TrustLine in blockchain allows users to hold and transact in others' debt in specified currencies, enabling multi-currency dealings."
         placement="top" // Adjust placement as needed
       >
         <span>
           TrustLines <SmallInfoIcon /> {/* Use the SmallInfoIcon component */}
         </span>
      </Tooltip>
     ),
    align: 'right',
    width: '10%',
    order: true
  },
  {
    no: 10,
    id: 'supply',
    label: (
      <Tooltip
        title="The quantity of tokens in circulation within the market and held by the public is comparable to the shares in motion within the stock market."
        placement="top" // Adjust placement as needed
      >
        <span>
          Circulating Supply <SmallInfoIcon /> {/* Use the SmallInfoIcon component */}
        </span>
      </Tooltip>
    ),
    align: 'right',
    width: '13%',
    order: true
  },
  {
    no: 11,
    id: 'historyGraph',
    label: 'Last 7 Days',
    align: 'right',
    width: '13%',
    order: false
  },
  { id: '' }
];

export default function TokenListHead({
  order,
  orderBy,
  onRequestSort,
  scrollLeft,
  tokens = [], // Provide a default empty array
  scrollTopLength
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const createSortHandler = (id, no) => (event) => {
    onRequestSort(event, id, no);
  };

  const { darkMode } = useContext(AppContext);

  return (
    <TableHead
      sx={{
        position: 'sticky',
        zIndex: 1002,
        transform: `translateY(${scrollTopLength}px)`,
        background: darkMode ? '#000000' : '#FFFFFF'
      }}
    >
      <TableRow
        sx={{
          '& .MuiTableCell-root': {
            fontSize: isMobile && 12,
            fontWeight: '700'
          },
          '& .MuiTableCell-root:nth-of-type(1)': {
            position: 'sticky',
            zIndex: 1001,
            left: 0,
            background: darkMode ? '#000000' : '#FFFFFF'
          },
          '& .MuiTableCell-root:nth-of-type(2)': {
            position: 'sticky',
            zIndex: 1001,
            left: (tokens?.length ?? 0) > 0 ? (isMobile ? 28 : 52) : isMobile ? 8 : 32,
            background: darkMode ? '#000000' : '#FFFFFF',
            '&:before':
              isMobile && scrollLeft
                ? {
                    content: "''",
                    boxShadow: 'inset 10px 0 8px -8px #00000026',
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    bottom: '-1px',
                    width: '30px',
                    transform: 'translate(100%)',
                    transition: 'box-shadow .3s',
                    pointerEvents: 'none'
                  }
                : {}
          },
          '& .MuiTableCell-root:nth-of-type(3)': !isMobile && {
            position: 'sticky',
            zIndex: 1001,
            // left: tokens.length > 0 ? 99 : 72,
            background: darkMode ? '#000000' : '#FFFFFF',
            '&:before': scrollLeft
              ? {
                  content: "''",
                  boxShadow: 'inset 10px 0 8px -8px #00000026',
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  bottom: '-1px',
                  width: '30px',
                  transform: 'translate(100%)',
                  transition: 'box-shadow .3s',
                  pointerEvents: 'none'
                }
              : {}
          }
        }}
      >
        {TABLE_HEAD.map((headCell) => {
          if (isMobile && headCell.id === 'id') return null;
          return (
            <StickyTableCell
              key={headCell.id}
              align={headCell.align}
              sortDirection={orderBy === headCell.id ? order : false}
              width={headCell.width}
              // ... [Rest of your StickyTableCell styles]
            >
              {headCell.order ? (
                <TableSortLabel
                  hideSortIcon={!headCell.order}
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'desc'}
                  onClick={createSortHandler(headCell.id, headCell.no)}
                >
                  {headCell.label}
                  {orderBy === headCell.id && (
                    <Box component="span" sx={{ ...visuallyHidden }}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  )}
                </TableSortLabel>
              ) : (
                // Render the label directly without TableSortLabel for unsortable columns
                headCell.label
              )}
            </StickyTableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}
