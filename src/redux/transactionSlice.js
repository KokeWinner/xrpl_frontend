const { createSlice } = require("@reduxjs/toolkit")

const initialState = {
    isProcessing: 0, //0: initial, 1: open sign, 2: success, 3: reject
    txHash: '',
}

const transactionSlice = createSlice({
    name: "transaction",
    initialState,
    reducers: {
        updateProcess: (state, action) => {
            state.isProcessing = action.payload;
        },

        updateTxHash: (state, action) => {
            state.txHash = action.payload;
        }

    }
});

export const { updateProcess, updateTxHash } = transactionSlice.actions;
export const selectProcess = (state) => state.transaction.isProcessing;
export const selectTxHash = (state) => state.transaction.txHash;

export default transactionSlice.reducer;