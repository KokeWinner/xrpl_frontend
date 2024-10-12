import React from 'react';

// Material
import {
    Stack,
    Typography
} from '@mui/material';

// Utils
import { CollectionListType } from 'src/utils/constants';

// Components
import CollectionList from './CollectionList';

export default function Collections({category}) {
    return (
        <>
            <Stack spacing={1} sx={{mt: 4, mb:3}}>
                <Typography variant="h1a">{category} collections</Typography>
            </Stack>
            
            <Stack sx={{mt:5, minHeight: '50vh'}}>
                <CollectionList type={CollectionListType.CATEGORY} category={category} />
            </Stack>
        </>
    );
}
