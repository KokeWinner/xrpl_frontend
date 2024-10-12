// Material
import {
    Box,
    Container,
    Grid,
    Typography,
} from '@mui/material';

// Components
import Trait from './Trait';

/*
[
    {
        "trait_type": "Background",
        "value": "Sine Wave"
    },
    {
        "trait_type": "Skins",
        "value": "Camo"
    },
    {
        "trait_type": "Clothes",
        "value": "Runner Tanktop"
    },
    {
        "trait_type": "Necklace",
        "value": "Heart Pendant Necklace Blue"
    },
    {
        "trait_type": "Eyes",
        "value": "Happy Eyes"
    },
    {
        "trait_type": "Eyewear",
        "value": "None"
    },
    {
        "trait_type": "Headwear",
        "value": "None"
    },
    {
        "trait_type": "Earrings",
        "value": "Shell Earrings"
    },
    {
        "trait_type": "Mouth",
        "value": "White Teeth"
    }
]
*/

// Fixed number of columns
const gridContainer = {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)"
};

// Variable number of columns
const gridContainer2 = {
    display: "grid",
    gridAutoColumns: "1fr",
    gridAutoFlow: "column"
};

const gridItem = {
    margin: "0px",
    // border: "1px solid red"
};

// https://stackoverflow.com/questions/50743402/material-ui-grid-item-height
export default function Properties({ properties, total }) {
    return (
        <Grid container spacing={1}>
        {
            properties.map((item, idx) => (
                <Grid item key={"Properties" + idx} xs={6} sm={4} md={3}>
                    <Trait prop={item} total={total || 0} />
                </Grid>
            ))
        }
        </Grid>
    );
}

// export default function Properties({ properties, total }) {
//     return (
//         <Grid container spacing={2}>
//         {
//             properties.map((item, idx) => (
//                 <Box key={"Properties" + idx}>
//                     <Trait prop={item} total={total || 0} />
//                 </Box>
//             ))
//         }
//         </Grid>
//     );
// }
