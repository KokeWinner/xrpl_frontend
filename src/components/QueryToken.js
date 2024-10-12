import React, { useContext } from 'react';
import { useState } from 'react';
import {
  LazyLoadImage,
} from 'react-lazy-load-image-component';

// Material
import {
  styled,
  Stack,
  Typography
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CurrencySearchModal from 'src/components/CurrencySearchModal';

// Context
import { AppContext } from 'src/AppContext';

const TokenImage = styled(LazyLoadImage)(({ theme }) => ({
  borderRadius: '50%',
  overflow: 'hidden'
}));

function truncate(str, n) {
  if (!str) return '';
  //return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
  return str.length > n ? str.substr(0, n - 1) + '... ' : str;
}

export default function QueryToken({ token, onChangeToken }) {
  const { darkMode } = useContext(AppContext);

  const [open, setOpen] = useState(false);

  const onDismiss = () => {
    setOpen(false);
  }

  const { md5, name, user, kyc, isOMCF } = token;
  const imgUrl = `https://s1.xrpl.to/token/${md5}`;

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ p: 0, cursor: "pointer", '&:hover': { opacity: 0.8} }}
        onClick={() => setOpen(true)}
      >
        <TokenImage
          src={imgUrl} // use normal <img> attributes as props
          width={48}
          height={48}
          onError={(event) => (event.target.src = '/static/alt.webp')}
        />
        <Stack>
          <Typography
            variant="token"
            color={
              // isOMCF !== 'yes' ? (darkMode ? '#fff' : '#222531') : ''
              isOMCF !== 'yes'
                ? darkMode
                  ? '#fff'
                  : '#222531'
                : darkMode
                  ? '#007B55'
                  : '#4E8DF4'
            }
            noWrap
          >
            {truncate(name, 8)}
          </Typography>
          <Typography
            variant="caption"
            color={
              isOMCF !== 'yes' ? (darkMode ? '#fff' : '#222531') : ''
            }
            noWrap
          >
            {truncate(user, 13)}
            {kyc && (
              <Typography variant="kyc" sx={{ ml: 0.2 }}>
                KYC
              </Typography>
            )}
          </Typography>
          {/* <Typography variant="small" color={isOMCF!=='yes'?'#222531':''}>{date}</Typography> */}
        </Stack>
        <ArrowDropDownIcon/>
      </Stack>

      <CurrencySearchModal token={token} open={open} onDismiss={onDismiss} onChangeToken={onChangeToken} />
    </>
  );
}
