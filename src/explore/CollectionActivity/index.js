import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { Lightbox } from 'react-modal-image';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { withStyles } from '@mui/styles';
import {
  styled,
  useTheme,
  Avatar,
  Backdrop,
  Box,
  Button,
  CardMedia,
  Container,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  Divider,
  Paper,
  Chip,
  Skeleton
} from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AnimationIcon from '@mui/icons-material/Animation';
import PaymentIcon from '@mui/icons-material/Payment';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import PagesIcon from '@mui/icons-material/Pages';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { AppContext } from 'src/AppContext';

import { getNftCoverUrl } from 'src/utils/parse/utils';
import { formatDateTime } from 'src/utils/formatTime';
import { Activity } from 'src/utils/constants';
import { normalizeAmount, normalizeCurrencyCodeXummImpl } from 'src/utils/normalizers';

import { PulseLoader, ClockLoader } from 'react-spinners';
import { RotatingSquare, Vortex } from 'react-loader-spinner';

import ListToolbar from './ListToolbar';
import FlagsContainer from 'src/components/Flags';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontWeight: 600
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover
  },
  '&:last-child td, &:last-child th': {
    border: 0
  }
}));

export default function CollectionActivity({ collection }) {
  const theme = useTheme();
  const BASE_URL = 'https://api.xrpnft.com/api';

  const { openSnackbar } = useContext(AppContext);

  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);
  const [total, setTotal] = useState(0);
  const [hists, setHists] = useState([]);
  const [filteredHists, setFilteredHists] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);

  const [lightBoxImgUrl, setLightBoxImgUrl] = useState('');

  const closeLightbox = () => {
    setOpen(false);
  };

  useEffect(() => {
    function getActivities() {
      setLoading(true);

      axios
        .get(`${BASE_URL}/collectionhistory/?cid=${collection.uuid}&page=${page}&limit=${rows}`)
        .then((res) => {
          let ret = res.status === 200 ? res.data : undefined;
          if (ret) {
            setTotal(ret.total);
            setHists(ret.hists);
          }
        })
        .catch((err) => {
          console.log('Error on getting collection history list!!!', err);
        })
        .then(function () {
          // always executed
          setLoading(false);
        });
    }
    getActivities();
  }, [page, rows]);

  useEffect(() => {
    if (hists.length > 0) {
      if (activeFilter === 'ALL') {
        setFilteredHists(hists);
      } else {
        const filtered = hists.filter((hist) => hist.type === activeFilter);
        setFilteredHists(filtered);
      }
    }
  }, [hists, activeFilter]);

  const handleFilter = (type) => {
    setActiveFilter(type === activeFilter ? 'ALL' : type);
  };

  const getUniqueEventTypes = () => {
    const types = new Set(hists.map((hist) => hist.type));
    return ['ALL', ...Array.from(types)];
  };

  return (
    <Container maxWidth={false} sx={{ pl: 0, pr: 0, maxWidth: '2000px' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          {collection.name} Activity
        </Typography>

        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {getUniqueEventTypes().map((type) => (
            <Chip
              key={type}
              label={type === 'ALL' ? 'All Events' : type}
              onClick={() => handleFilter(type)}
              color={activeFilter === type ? 'primary' : 'default'}
              variant={activeFilter === type ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        {loading ? (
          <Stack spacing={2}>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={60} />
            ))}
          </Stack>
        ) : filteredHists.length === 0 ? (
          <Stack alignItems="center" sx={{ mt: 5 }}>
            <Typography variant="h6">No Activities</Typography>
          </Stack>
        ) : (
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell>Type</StyledTableCell>
                <StyledTableCell>Details</StyledTableCell>
                <StyledTableCell>Price</StyledTableCell>
                <StyledTableCell>Account</StyledTableCell>
                <StyledTableCell>Time</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHists.map((row, idx) => {
                const {
                  type,
                  uuid,
                  NFTokenID,
                  account,
                  cid,
                  name,
                  meta,
                  dfile,
                  files,
                  cost,
                  quantity,
                  time
                } = row;

                const isVideo = meta?.video ? true : false;

                const imgUrl = getNftCoverUrl({ files }, 'small');

                const strDateTime = formatDateTime(time);

                const amount = normalizeAmount(row.amount);

                let strActivity = '';
                let componentIcon = <TaskAltIcon />;
                switch (type) {
                  case 'BUY_MINT':
                    strActivity = 'Buy Mint';
                    componentIcon = <ShoppingBagIcon />;
                    break;

                  case 'MINTED':
                    strActivity = 'Mint a NFT';
                    componentIcon = <PagesIcon />;
                    break;

                  case 'BURN':
                    componentIcon = <FireplaceIcon />;
                    strActivity = 'Burnt a NFT';
                    break;

                  case 'CREATE_SELL_OFFER':
                    componentIcon = <LocalOfferIcon />;
                    strActivity = 'Create Sell Offer';
                    break;

                  case 'CREATE_BUY_OFFER':
                    componentIcon = <LocalOfferIcon />;
                    strActivity = 'Create Buy Offer';
                    break;

                  case 'CANCEL_SELL_OFFER':
                    componentIcon = <HighlightOffIcon />;
                    strActivity = 'Cancel Sell Offer';
                    break;

                  case 'CANCEL_BUY_OFFER':
                    componentIcon = <HighlightOffIcon />;
                    strActivity = 'Cancel Buy Offer';
                    break;

                  case 'TRANSFER':
                    strActivity = 'Transfer';
                    componentIcon = <TransferWithinAStationIcon />;
                    break;

                  case 'SALE':
                    strActivity = 'Sale';
                    componentIcon = <PaymentIcon />;
                    break;

                  default:
                    strActivity = `Unhandled Activity: ${type}`;
                    componentIcon = <HelpOutlineIcon />;
                    break;
                }

                return (
                  <StyledTableRow key={time + '' + idx}>
                    <StyledTableCell>
                      <Chip
                        icon={componentIcon}
                        label={strActivity}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      {type === 'BUY_MINT' ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar alt="C" src={`https://s1.xrpl.to/token/${cost?.md5}`} />

                          <Stack>
                            <Stack direction="row" spacing={0.8} alignItems="center">
                              <Typography variant="body2">Price: </Typography>
                              <Typography variant="body1">
                                {cost?.amount} {cost?.name}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                              <Typography variant="body2">Quantity: </Typography>
                              <Typography variant="body1">{quantity}</Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      ) : (
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Link
                              component="button"
                              underline="none"
                              onClick={() => {
                                if (!isVideo) {
                                  setLightBoxImgUrl(imgUrl);
                                  setOpen(true);
                                }
                              }}
                            >
                              <CardMedia
                                component={isVideo ? 'video' : 'img'}
                                image={imgUrl}
                                alt={'NFT'}
                                autoPlay={isVideo}
                                loop={isVideo}
                                muted
                                style={{
                                  width: '48px'
                                }}
                              />
                            </Link>
                            <Link href={`/nft/${NFTokenID}`} rel="noreferrer noopener nofollow">
                              <Typography variant="body1" noWrap>
                                {name}
                              </Typography>
                            </Link>
                          </Stack>
                        </Stack>
                      )}
                    </StyledTableCell>
                    <StyledTableCell>
                      {type === 'SALE' ? (
                        <Typography variant="body2" noWrap>
                          {cost.amount} {normalizeCurrencyCodeXummImpl(cost.currency)}
                        </Typography>
                      ) : (
                        <>
                          {type === 'CREATE_SELL_OFFER' ||
                          type === 'CREATE_BUY_OFFER' ||
                          type === 'CANCEL_SELL_OFFER' ||
                          type === 'CANCEL_SELL_OFFER' ? (
                            <Typography variant="body2" noWrap>
                              {amount.amount} {normalizeCurrencyCodeXummImpl(amount.currency)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" noWrap>
                              - - -
                            </Typography>
                          )}
                        </>
                      )}
                    </StyledTableCell>
                    <StyledTableCell>
                      <Stack direction="row" spacing={0.2} alignItems="center">
                        <Link href={`/account/${account}`}>
                          <Typography variant="body2" noWrap>
                            {' '}
                            {account}
                          </Typography>
                        </Link>
                        <CopyToClipboard
                          text={account}
                          onCopy={() => openSnackbar('Copied!', 'success')}
                        >
                          <Tooltip title="Click to copy">
                            <IconButton size="small">
                              <ContentCopyIcon fontSize="small" sx={{ width: 16, height: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </CopyToClipboard>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography variant="body2" noWrap>
                        {strDateTime}
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>
      {total > 0 && (
        <ListToolbar count={total} rows={rows} setRows={setRows} page={page} setPage={setPage} />
      )}

      {open && (
        <Lightbox
          small={lightBoxImgUrl}
          large={lightBoxImgUrl}
          hideDownload
          hideZoom
          onClose={closeLightbox}
        />
      )}
    </Container>
  );
}
