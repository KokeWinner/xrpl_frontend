import * as React from 'react';
import { useState, useContext } from 'react';
import { Stack, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import useKeypress from 'react-use-keypress';

import {
  Box,
} from '@mui/material';
import { AppContext } from 'src/AppContext';
import SearchModal from './SearchModal';

const NavSearchBar = () => {

  const { darkMode } = useContext(AppContext);
  const [open, setOpen] = useState(false);

  useKeypress('/', () => {
    setOpen(true);
  });

  const openModal = (event) => {
    event.stopPropagation();
    setOpen(true);
  }

  return (
    <>
      <Stack direction="row" bgcolor={darkMode ? "#1C1C1C" : "#F8F9FA"} alignItems="center" p={1} sx={{ borderRadius: "8px", cursor: "pointer" }} onClick={openModal}>
        <SearchIcon />
        <Typography width="200px">Search</Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            backgroundColor: '#a6b0c3',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          /
        </Box>
      </Stack>
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default NavSearchBar;
