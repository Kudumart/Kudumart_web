import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: { data: null, currencies: null, ipInfo: null },
    reducers: {
        setKuduUser(state, action) {
            state.data = action.payload;
        },

        setCurrencyData(state, action) {
            state.currencies = action.payload;
        },

        setIPInfo(state, action) {
            state.ipInfo = action.payload
        }
    },
});

export const { setKuduUser, setCurrencyData, setIPInfo } = userSlice.actions;
export default userSlice.reducer;
