// Material
import {
    Button,
    Link,
    Stack,
    Typography
} from '@mui/material';

// Utils
import { CollectionListType } from 'src/utils/constants';

// Components
import CollectionList from './CollectionList';

export default function MyCollections() {
    return (
        <>
            <Stack spacing={1} sx={{mt: 4, mb:3}}>
                <Typography variant="h1a">My Collections</Typography>
                <Typography variant="d1">Create, curate, and manage collections of unique NFTs to share and sell.</Typography>
            </Stack>
            <Button component={Link} href="/collection/create" variant="contained" color="primary">
                Create a collection
            </Button>
            <Stack sx={{mt:5, minHeight: '50vh'}}>
                <CollectionList type={CollectionListType.MINE}/>
            </Stack>
        </>
    );
}
