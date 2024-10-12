// src/redux/store.js
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import statusReducer from './statusSlice';
import transactionReducer from './transactionSlice';
import chatReducer from './chatSlice';
import { CookieStorage } from 'redux-persist-cookie-storage';
import Cookies from './customCookiesParser';
import { persistReducer } from 'redux-persist';
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

const persistConfig = {
  key: 'root',
  storage: new CookieStorage(Cookies /*, options */)
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    status: statusReducer,
    transaction: transactionReducer,
    chat: chatReducer,
  })
);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

// export const persistor = globalThis.window ? persistStore(store) : store;

export function configureRedux(data) {
  let defaultState = initialState;
  if (data) {
    defaultState = {
      metrics: {
        total: data.total,
        USD: data.exch.USD,
        EUR: data.exch.EUR,
        JPY: data.exch.JPY,
        CNY: data.exch.CNY,
        XRP: 1,
        H24: data.H24,
        global: data.global
      },
      filteredCount: data.count,
      activeFiatCurrency: defaultState.activeFiatCurrency
    };
  }

  const _store = configureStore({
    reducer: {
      status: statusReducer,
      transaction: transactionReducer,
      chat: chatReducer
    },
    preloadedState: { status: defaultState },
    devTools: process.env.NODE_ENV !== 'production'
  });

  return _store;
}
