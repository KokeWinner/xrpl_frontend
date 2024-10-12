import { createSlice } from '@reduxjs/toolkit';
import { currencyConfig } from 'src/utils/constants';

const initialState = {
  metrics: {
    total: 0,
    USD: 100,
    EUR: 100,
    JPY: 100,
    CNY: 100,
    XRP: 1,
    H24: {
      transactions24H: 0,
      tradedXRP24H: 0,
      tradedTokens24H: 0,
      activeAddresses24H: 0,
      totalAddresses: 0,
      totalOffers: 0,
      totalTrustLines: 0
    },
    global: {
      gMarketcap: 0,
      gMarketcapPro: 0,
      gDexVolume: 0,
      gDexVolumePro: 0,
      gScamVolume: 0,
      gScamVolumePro: 0,
      gStableVolume: 0,
      gStableVolumePro: 0,
      gXRPdominance: 0,
      gXRPdominancePro: 0
    }
  },
  filteredCount: 0,
  activeFiatCurrency: currencyConfig.activeFiatCurrency
};

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    update_metrics: (state, action) => {
      const data = action.payload;
      const metrics = {
        total: data.total || 0,
        USD: data.exch?.USD || 100,
        EUR: data.exch?.EUR || 100,
        JPY: data.exch?.JPY || 100,
        CNY: data.exch?.CNY || 100,
        XRP: 1,
        H24: data.H24 || initialState.metrics.H24,
        global: data.global || initialState.metrics.global
      };
      Object.assign(state.metrics, metrics);
    },
    update_filteredCount: (state, action) => {
      const data = action.payload;
      state.filteredCount = data.count;
    },
    update_activeCurrency: (state, action) => {
      const data = action.payload;
      state.activeFiatCurrency = data.activeFiatCurrency;
    }
  }
});

export const { update_metrics, update_filteredCount, update_activeCurrency } =
  statusSlice.actions;

export const selectMetrics = (state) => state.status.metrics;
export const selectFilteredCount = (state) => state.status.filteredCount;
export const selectActiveFiatCurrency = (state) =>
  state.status.activeFiatCurrency;

export default statusSlice.reducer;

// export function configureRedux(data) {
//   let defaultState = initialState;
//   if (data) {
//     defaultState = {
//       metrics: {
//         total: data.total,
//         USD: data.exch.USD,
//         EUR: data.exch.EUR,
//         JPY: data.exch.JPY,
//         CNY: data.exch.CNY,
//         H24: data.H24,
//         global: data.global
//       },
//       filteredCount: data.count,
//       activeFiatCurrency: defaultState.activeFiatCurrency
//     };
//   }

//   const persistedReducer = persistReducer(persistConfig, combineReducers({
//     status: statusSlice.reducer
//   }));

//   const store = configureStore({
//     reducer: persistedReducer,
//     preloadedState: { status: defaultState },
//     devTools: process.env.NODE_ENV !== "production",
//     middleware: [thunk],
//   });

//   return store;
// }

