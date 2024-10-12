import { Alert, AlertTitle, CircularProgress, Snackbar, Stack, Typography } from "@mui/material";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { useDispatch, useSelector } from "react-redux";
import { selectProcess, selectTxHash, updateProcess } from "src/redux/transactionSlice";

const TransactionAlert = () => {

    const dispatch = useDispatch();
    const isProcessing = useSelector(selectProcess);
    const txHash = useSelector(selectTxHash);

    const handleClose = (_, reason) => {

        if (reason === 'clickaway') {
            return;
        }
        dispatch(updateProcess(0));
    }

    const handleTitle = () => {
        switch (isProcessing) {
            case 1:
                return "waiting for wallet to sign transaction";
                break;
            case 2:
                return "transaction confirmed";
                break;
            case 3:
                return "transaction cancelled";
                break;
        }
    }

    const handleContent = () => {
        switch (isProcessing) {
            case 1:
                return <Typography color="primary" sx={{ textTransform: "capitalize" }}>pending wallet to sign</Typography>;
                break;
            case 2:
                return <a href={`https://bithomp.com/explorer/${txHash}`} target="_blank" rel="noreferrer"><Typography sx={{ textTransform: "capitalize" }}>view transaction</Typography></a>
                break;
            case 3:
                return <Typography color="error" sx={{ textTransform: "capitalize" }}>Transaction is cancelled</Typography>;
                break;
        }
    }

    const handleIcon = () => {
        switch (isProcessing) {
            case 1:
                return <CircularProgress
                    disableShrink
                    size={20}
                    color="primary"
                />
                break;
            case 2:
                return <TaskAltIcon color="primary" />
                break;
            case 3:
                return <WarningAmberIcon color="error" />
                break;
        }
    }

    return (
        <Snackbar
            open={isProcessing > 0}
            autoHideDuration={5000}
            key={isProcessing}
            onClose={isProcessing > 1 ? handleClose : null}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
            <Alert
                severity="tx"
                sx={{ width: '100%' }}
                icon={handleIcon()}
                onClose={isProcessing > 1 ? handleClose : null}
                variant="filled"
            >
                <AlertTitle sx={{ textTransform: "capitalize" }} color={isProcessing == 3 ? "error" : "primary"}>
                    {handleTitle()}
                </AlertTitle>

                <Stack mt={1} direction="row" spacing={1} alignItems="center">
                    {handleContent()}
                </Stack>

            </Alert>
        </Snackbar>
    )
}

export default TransactionAlert;