import { visuallyHidden } from '@mui/utils';
import { withStyles } from '@mui/styles';
import {
    Box,
    TableRow,
    TableCell,
    TableHead,
    TableSortLabel,
    useTheme,
    useMediaQuery
} from '@mui/material';

const StickyTableCell = withStyles((theme) => ({
    head: {
        position: 'sticky',
        zIndex: 1000,
        top: 0
    }
}))(TableCell);

const TABLE_HEAD = (isMobile, timeFrame) => {
    const volumeLabel = timeFrame === '24h' ? 'Volume (24h)' : 'Volume (All)';

    if (isMobile) {
        return [
            {
                no: 0,
                id: 'name',
                label: 'Collection',
                align: 'left',
                width: '40%',
                order: false
            },
            {
                no: 1,
                id: 'floor.amount',
                label: 'Floor',
                align: 'right',
                width: '30%',
                order: true
            },
            {
                no: 2,
                id: 'volume',
                label: volumeLabel,
                align: 'right',
                width: '30%',
                order: true
            }
        ];
    }
    return [
        {
            no: 0,
            id: 'name',
            label: 'Collection',
            align: 'left',
            width: '40%',
            order: false
        },
        {
            no: 1,
            id: 'volume',
            label: volumeLabel,
            align: 'right',
            width: '20%',
            order: true
        },
        {
            no: 2,
            id: 'floor.amount',
            label: 'Floor',
            align: 'right',
            width: '10%',
            order: true
        },
        {
            no: 3,
            id: 'owners',
            label: 'Owners',
            align: 'right',
            width: '10%',
            order: true
        },
        {
            no: 4,
            id: 'items',
            label: 'Items',
            align: 'right',
            width: '10%',
            order: true
        }
    ];
};

export default function ListHead({ order, orderBy, onRequestSort, timeFrame }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const createSortHandler = (id) => (event) => {
        onRequestSort(event, id);
    };

    return (
        <TableHead>
            <TableRow style={{ background: '#00000000' }}>
                {TABLE_HEAD(isMobile, timeFrame).map((headCell) => (
                    <StickyTableCell
                        key={headCell.id}
                        align={headCell.align}
                        sortDirection={orderBy === headCell.id ? order : false}
                        width={headCell.width}
                        sx={{
                            ...(headCell.no > 0 && {
                                pl: 0,
                                pr: 0
                            })
                        }}
                    >
                        <TableSortLabel
                            hideSortIcon
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'desc'}
                            onClick={
                                headCell.order
                                    ? createSortHandler(headCell.id)
                                    : undefined
                            }
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box sx={{ ...visuallyHidden }}>
                                    {order === 'desc'
                                        ? 'sorted descending'
                                        : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </StickyTableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}
