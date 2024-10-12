import axios from 'axios';
import { useContext, useState } from 'react';

// Material
import { Box, Button, Tab } from '@mui/material';

import { TabContext, TabList, TabPanel } from '@mui/lab';

// Components
import NFTs from './NFTs';
import CollectionActivity from './CollectionActivity';
import { AppContext } from 'src/AppContext';

export default function ExploreNFT({ collection }) {
  const BASE_URL = 'https://api.xrpnft.com/api';

  const { deletingNfts, accountProfile } = useContext(AppContext);

  const isAdmin = accountProfile?.admin;

  const [value, setValue] = useState('tab-nfts');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleRemoveAll = () => {
    if (deletingNfts.length === 0 || !isAdmin) return;

    const nftNames = deletingNfts
      ?.map((nft) => `"${nft.meta?.name}"` || `"${nft.meta?.Name}"` || `"No Name"`)
      ?.join(', ');
    const idsToDelete = deletingNfts?.map((nft) => nft._id);

    if (!confirm(`You're about to delete the following NFTs ${nftNames}?`)) return;

    axios
      .delete(`${BASE_URL}/nfts`, {
        data: {
          issuer: collection?.account,
          taxon: collection?.taxon,
          cid: collection?.uuid,
          idsToDelete
        }
      })
      .then((res) => {
        location.reload();
      })
      .catch((err) => {
        console.log('Error on removing nfts!', err);
      });
  };

  return (
    <>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="NFTs" value="tab-nfts" />
              <Tab label="Activities" value="tab-activities" />
            </TabList>

            {isAdmin && (
              <Button
                variant="outlined"
                color="error"
                sx={{ mb: 1, py: 0.5 }}
                onClick={handleRemoveAll}
                disabled={deletingNfts.length === 0}
              >
                Delete All
              </Button>
            )}
          </Box>
          <TabPanel value="tab-nfts" sx={{ pl: 0, pr: 0 }}>
            <NFTs collection={collection} />
          </TabPanel>
          <TabPanel value="tab-activities" sx={{ pl: 0, pr: 0 }}>
            {/* <Typography color='red'>Coming soon.</Typography> */}
            <CollectionActivity collection={collection} />
          </TabPanel>
        </TabContext>
      </Box>
    </>
  );
}
