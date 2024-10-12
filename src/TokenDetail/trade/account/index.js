import PropTypes from 'prop-types';
import { useState } from 'react';

// Material
import {
    styled
} from '@mui/material';

import {
    Box,
    Stack,
    Tab,
    Tabs
} from '@mui/material';

// Components
import History from './History';
import Orders from './Orders';
// ----------------------------------------------------------------------
//import StackStyle from 'src/components/StackStyle';
// ----------------------------------------------------------------------

function TabPanel(props) {
    const { children, value, id, ...other } = props;
 
    return (
        <div
            role="tabpanel"
            hidden={value !== id}
            id={`simple-tabpanel-${id}`}
            aria-labelledby={`simple-tab-${id}`}
            {...other}
        >
            {value === id && (
                <Box sx={{
                    p: { xs: 0, md: 3 },
                    pt: { xs: 3 },
                }}>
                    {children}
                </Box>
            )}
        </div>
    );
}
  
TabPanel.propTypes = {
    children: PropTypes.node,
    id: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function Account({token, pair}) {
    const [tabID, setTabID] = useState(0);

    const handleChangeTab = (event, newID) => {
        setTabID(newID);
    };

    return (
        <>
            <Tabs value={tabID} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto" aria-label="token-tabs">
                <Tab value={0} label="OPEN ORDERS" {...a11yProps(0)} />
                <Tab value={1} label="TRADE HISTORY" {...a11yProps(1)} />
            </Tabs>

            <TabPanel value={tabID} id={0}>
                <Orders pair={pair} />
            </TabPanel>

            <TabPanel value={tabID} id={1}>
                <History token={token} />
            </TabPanel>

        </>
    );
}