import axios from 'axios';
import { useState, useEffect, useRef } from 'react';

// Material
import {
  alpha,
  styled,
  useTheme,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  toggleButtonGroupClasses,
  Paper
} from '@mui/material';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarRateIcon from '@mui/icons-material/StarRate';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import WhatshotIcon from '@mui/icons-material/Whatshot';

import FiberNewIcon from '@mui/icons-material/FiberNew';
import DoNotTouchIcon from '@mui/icons-material/DoNotTouch';
import UpdateDisabledIcon from '@mui/icons-material/UpdateDisabled';
import AppsIcon from '@mui/icons-material/Apps';
import CategoryIcon from '@mui/icons-material/Category';
import CollectionsIcon from '@mui/icons-material/Collections'; // Import the icon for "NFTs"
import DehazeIcon from '@mui/icons-material/Dehaze';
import WindowIcon from '@mui/icons-material/Window';

// Iconify
import { Icon } from '@iconify/react';
import searchFill from '@iconify/icons-eva/search-fill';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Component
import CategoriesDrawer from 'src/components/CategoriesDrawer';
import { borderRadius } from 'styled-system';
import { useRouter } from 'next/router';

function normalizeTag(tag) {
  if (tag && tag.length > 0) {
    const tag1 = tag.split(' ').join('-'); // Replace space
    const tag2 = tag1.replace(/&/g, 'and'); // Replace &
    const tag3 = tag2.toLowerCase(); // Make lowercase
    const final = tag3.replace(/[^a-zA-Z0-9-]/g, '');
    return final;
  }
  return '';
}

// ----------------------------------------------------------------------
const RootStyle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${alpha('#CBCCD2', 0.1)}`
}));

const SearchBox = styled(OutlinedInput)(({ theme }) => ({
  width: 200,
  transition: theme.transitions.create(['width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter
  }),
  '&.Mui-focused': { width: 280 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`
  }
}));

const HeaderWrapper = styled(Box)(
  ({ theme }) => `
    width: 100%;
    display: flex;
    align-items: center;
    height: ${theme.spacing(10)};
    margin-bottom: ${theme.spacing(0)};
    border-radius: 0px;
    border-bottom: 1px solid ${alpha('#CBCCD2', 0.2)};
`
);

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    margin: theme.spacing(0.3),
    border: 0,
    borderRadius: "4px",
    height: "24px",
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
  },
  [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]:
    {
      marginLeft: -1,
      borderLeft: '1px solid transparent',
    },
}));

function getTagValue(tags, tagName) {
  if (!tags || tags.length < 1 || !tagName) return 0;
  const idx = tags.indexOf(tagName);
  if (idx < 0) return 0;
  return idx + 1;
}

// ----------------------------------------------------------------------
export default function SearchToolbar({
  tags,
  tagName,
  filterName,
  onFilterName,
  rows,
  viewType,
  setRows,
  showNew,
  setShowNew,
  showSlug,
  setShowSlug,
  showDate,
  setShowDate,
  setViewType
}) {
  const router = useRouter();
  const { accountProfile, openSnackbar } = useContext(AppContext);
  const isAdmin =
    accountProfile && accountProfile.account && accountProfile.admin;

  const [tagValue, setTagValue] = useState(getTagValue(tags, tagName));
  const [openCategoriesDrawer, setOpenCategoriesDrawer] = useState(false);

  const handleChangeRows = (e) => {
    setRows(parseInt(e.target.value, 10));
  };

  const handleDelete = () => { };

  const toggleCategoriesDrawer = (isOpen = true) => {
    setOpenCategoriesDrawer(isOpen);
  };

  const ShadowContent = styled('div')(
    ({ theme }) => `
        -webkit-box-flex: 1;
        flex-grow: 1;
        height: 1em;
        overflow: hidden;
        text-overflow: ellipsis;
        position: relative;
    
        &::before {
            content: "";
            position: absolute;
            left: 0px;
            top: 0px;
            width: 8em;
            height: 100%;
            background: linear-gradient(270deg, ${theme.palette.background.default}, rgba(255,255,255,0));
            z-index: 1000;
        }
    `
  );
  const { darkMode } = useContext(AppContext);
  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}
      >
        <Link
          underline="none"
          color="inherit"
          // target="_blank"
          href={`/watchlist`}
          rel="noreferrer noopener nofollow"
        >
          {/* <Button variant="outlined" startIcon={<StarRateIcon />} size="small" color="disabled">
                        Watchlist
                    </Button> */}
          <Chip
            variant={'outlined'}
            icon={<StarOutlineIcon fontSize="small" />}
            label={'Watchlist'}
            onClick={() => { }}
            sx={{
              borderRadius: '8px'
            }}
          />
        </Link>

        <Chip
          variant={'outlined'}
          icon={<TroubleshootIcon fontSize="small" />}
          label={'Portfolio'}
          onClick={() => {
            openSnackbar('Coming soon!', 'success');
          }}
          sx={{
            borderRadius: '8px'
          }}
        />
      </Stack>

      <RootStyle>
        {/* <SearchBox
                    value={filterName}
                    onChange={onFilterName}
                    placeholder="Search ..."
                    size="small"
                    startAdornment={
                        <InputAdornment position="start">
                            <Box component={Icon} icon={searchFill} sx={{ color: 'text.disabled' }} />
                        </InputAdornment>
                    }
                    sx={{pb:0.3}}
                /> */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            flexWrap: 'wrap',
            borderRadius: "6px",
            padding: "1px 4px"
          }}
        >
          <StyledToggleButtonGroup
            size="small"
            exclusive
            value={viewType}
            onChange={(_, newType) => setViewType(newType)}
          >
            <ToggleButton size="small" value="row">
              <DehazeIcon fontSize="16px"/>
            </ToggleButton>
            <ToggleButton size="small" value="heatmap" onClick={() => router.push('/crypto-heatmap')}>
              <WindowIcon fontSize="16px"/>
            </ToggleButton>
          </StyledToggleButtonGroup>
        </Paper>

        <Tabs
          value={tagValue}
          // onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="tag-tabs"
          sx={{
            '& .MuiTabs-indicator': {
              display: 'none'
            },
            '& .MuiTabs-flexContainer': {
              justifyContent: 'flex-start' // Align tabs to the left
            }
          }}
        >
          <Tab
            disableRipple
            label={
              <Link
                href={`/`}
                sx={{ pl: 0, pr: 0, display: 'inline-flex' }}
                underline="none"
                rel="noreferrer noopener nofollow"
              >
                <Chip
                  size="small"
                  icon={<AppsIcon fontSize="small" />}
                  label={'All'}
                  onClick={handleDelete}
                  color={tagValue === 0 ? 'primary' : undefined}
                  sx={{
                    borderRadius: '4px'
                  }}
                />
              </Link>
            }
            style={{
              paddingLeft: 0,
              paddingRight: 0
            }}
          />

          <Tab
            disableRipple
            label={
              <Link
                href={`/collections`}
                sx={{ pl: 0, pr: 0, display: 'inline-flex' }}
                underline="none"
                rel="noreferrer noopener nofollow"
              >
                <Chip
                  size="small"
                  icon={<CollectionsIcon fontSize="small" />}
                  label={'NFTs'}
                  onClick={handleDelete}
                  color={tagValue === 1 ? 'primary' : undefined}
                  sx={{
                    borderRadius: '4px'
                  }}
                />
              </Link>
            }
            style={{
              paddingLeft: 0,
              paddingRight: 0
            }}
          />

          <Tab
            key={0}
            value={0}
            disableRipple
            label={
              <Chip
                size="small"
                icon={<CategoryIcon fontSize="small" />}
                label={'Categories'}
                onClick={() => setOpenCategoriesDrawer(true)}
                sx={{
                  color: darkMode ? '#007B55 !important  ' : '#5569ff !important',
                  borderRadius: '4px'
                }}
              />

            }

            style={{
              paddingLeft: 0,
              paddingRight: 0
            }}
          />

          <Divider
            orientation="vertical"
            variant="middle"
            flexItem
            sx={{
              display: { xs: 'none', md: 'flex' },
              mx: 3, // Adjust this margin to ensure the divider is visible
              my: 'auto',
            }}
          />

          {tags &&
            tags?.slice(0, 12)?.map((tag, idx) => {
              const nTag = normalizeTag(tag);
              return (
                <Tab
                  key={idx + 1}
                  value={idx + 1}
                  disableRipple
                  label={
                    <Link
                      href={`/view/${nTag}`}
                      sx={{ pl: 0, pr: 0, display: 'inline-flex' }}
                      underline="none"
                      rel="noreferrer noopener nofollow"
                    >
                      <Chip
                        size="small"
                        label={
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <WhatshotIcon fontSize="small" style={{ marginRight: 4, color: 'orange' }} />
                            {tag}
                          </span>
                        }
                        onClick={handleDelete}
                        color={normalizeTag(tagName) === nTag ? 'primary' : undefined}
                        sx={{
                          borderRadius: '4px',
                          // Additional styling here if needed
                        }}
                      />
                    </Link>
                  }
                  style={{
                    paddingLeft: 0,
                    paddingRight: 0
                  }}
                />
              );
            })}
        </Tabs>

        <Stack
          direction="row"
          alignItems="center"
          sx={{ display: { xs: 'none', md: 'flex' }, ml: 0 }}
        >
          {isAdmin && (
            <Stack direction="row" alignItems="center" sx={{ mr: 2, mt: 0.5 }}>
              <IconButton
                onClick={() => {
                  setShowNew(!showNew);
                }}
              >
                <FiberNewIcon color={showNew ? 'error' : 'inherit'} />
              </IconButton>

              <IconButton
                onClick={() => {
                  setShowSlug(!showSlug);
                }}
              >
                <DoNotTouchIcon color={showSlug ? 'error' : 'inherit'} />
              </IconButton>

              <IconButton
                onClick={() => {
                  setShowDate(!showDate);
                }}
              >
                <UpdateDisabledIcon color={showDate ? 'error' : 'inherit'} />
              </IconButton>
            </Stack>
          )}
          Rows
          <Select
            value={rows}
            onChange={handleChangeRows}
            sx={{
              mt: 0.4,
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
            }}
          >
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </Stack>

        <CategoriesDrawer
          isOpen={openCategoriesDrawer}
          toggleDrawer={toggleCategoriesDrawer}
          tags={tags}
          normalizeTag={normalizeTag}
        />
      </RootStyle>
    </>
  );
}
