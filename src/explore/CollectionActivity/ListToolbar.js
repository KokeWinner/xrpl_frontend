import {
    styled,
    Grid,
    MenuItem,
    Pagination,
    Select,
    Stack,
    Typography,
    useTheme
} from '@mui/material';

// Remove the RootStyle definition since it's not being used

const CustomSelect = styled(Select)(({ theme }) => ({
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none'
    },
    '& .MuiSelect-select': {
        paddingRight: theme.spacing(4),
        fontWeight: 600,
        color: theme.palette.primary.main
    },
    '&:hover': {
        backgroundColor: theme.palette.action.hover
    }
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    color: theme.palette.text.secondary
}));

const StyledPagination = styled(Pagination)(({ theme }) => ({
    '& .MuiPaginationItem-root': {
        color: theme.palette.primary.main,
        '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            '&:hover': {
                backgroundColor: theme.palette.primary.dark
            }
        }
    }
}));

export default function NftListToolbar({ count, rows, setRows, page, setPage }) {
    const theme = useTheme();
    const num = count / rows;
    let page_count = Math.floor(num)
    if (num % 1 != 0) page_count++;

    const start = page * rows + 1;
    let end = start + rows - 1;
    if (end > count) end = count;

    const handleChangeRows = (event) => {
        setRows(parseInt(event.target.value, 10));
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage - 1);
        gotoTop(event);
    };

    const gotoTop = (event) => {
        const anchor = (event.target.ownerDocument || document).querySelector(
            '#back-to-top-tab-anchor',
        );

        if (anchor) {
            anchor.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <Grid container spacing={2} alignItems="center" sx={{ mt: 2, mb: 2 }}>
            <Grid item xs={12} md={4}>
                <StyledTypography variant="body2">
                    Showing {start} - {end} out of {count}
                </StyledTypography>
            </Grid>

            <Grid item xs={12} md={4}>
                <Stack alignItems='center'>
                    <StyledPagination 
                        page={page + 1} 
                        onChange={handleChangePage} 
                        count={page_count}
                        size={theme.breakpoints.down('md') ? "small" : "medium"}
                    />
                </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
                <Stack direction='row' alignItems='center' justifyContent="flex-end">
                    <StyledTypography variant="body2" sx={{ mr: 1 }}>Show Rows</StyledTypography>
                    <CustomSelect
                        value={rows}
                        onChange={handleChangeRows}
                    >
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                    </CustomSelect>
                </Stack>
            </Grid>
        </Grid>
    );

    /*

    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography>{start} - {end} out of {count}</Typography>
            <Pagination page={page+1} onChange={handleChangePage} count={page_count}/>
            <Stack direction='row' alignItems='center'>
                Rows
                <CustomSelect
                    value={rows}
                    onChange={handleChangeRows}
                >
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                </CustomSelect>
            </Stack>
        </Stack>
    );
    */
}
