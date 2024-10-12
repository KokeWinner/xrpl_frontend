const { createSlice } = require("@reduxjs/toolkit");

const initialState = {
    chatOpen: false,
    messages: []
}

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        toggleChatOpen: (state) => {
            state.chatOpen = !state.chatOpen;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        }
    }
});

export const { toggleChatOpen, addMessage } = chatSlice.actions;
export const selectChatOpen = state => state.chat.chatOpen;
export default chatSlice.reducer;