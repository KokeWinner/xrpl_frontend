import React, { useContext } from 'react';

// Material
import { Box, Chip, Link, Typography } from '@mui/material';

import Drawer from './Drawer';
import { AppContext } from 'src/AppContext';

export default function CategoriesDrawer({
  tags,
  isOpen,
  toggleDrawer,
  normalizeTag,
  md5
}) {
  const { darkMode } = useContext(AppContext);

  return (
    <Drawer
      headerStyle={{
        paddingTop: '10px',
        paddingBottom: '10px'
      }}
      isOpen={isOpen}
      toggleDrawer={toggleDrawer}
      title={
        <>
          <Box></Box>
          <Typography variant="h2">Categories</Typography>
        </>
      }
    >
      <Box sx={{ padding: 2 }}>
        {tags &&
          tags.map((tag, idx) => (
            <Link
              key={md5 + idx + tag}
              href={`/view/${normalizeTag(tag)}`}
              sx={{
                pl: 0,
                pr: 0,
                display: 'inline-flex',
                mr: 1,
                mb: 1
              }}
              underline="none"
              rel="noreferrer noopener nofollow"
            >
              <Chip
                label={tag}
                size="small"
                sx={{
                  borderInlineStart: `3px solid ${
                    darkMode ? '#17171a' : '#fff'
                  }`,
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              />
            </Link>
          ))}
      </Box>
    </Drawer>
  );
}
