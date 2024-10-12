import { useState, createContext, useEffect, useMemo } from 'react';
import axios from 'axios';

import { Backdrop } from '@mui/material';

// Redux
import { Provider } from 'react-redux';
import { configureRedux } from 'src/redux/store';

// Loader
import { PuffLoader } from 'react-spinners';
import { PersistGate } from 'redux-persist/integration/react';

export const AppContext = createContext({});

export function ContextProvider({ children, data, openSnackbar }) {

  const BASE_URL = 'https://api.xrpl.to/api';

  const [sync, setSync] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [activeFiatCurrency, setActiveFiatCurrency] = useState('USD');
  const [accountProfile, setAccountProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [deletingNfts, setDeletingNfts] = useState([]);
  const [store, setStore] = useState(configureRedux(data));

  const [open, setOpen] = useState(false);
  const [openWalletModal, setOpenWalletModal] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);

  const KEY_ACCOUNT_PROFILE = 'account_profile_2';
  const KEY_ACCOUNT_PROFILES = 'account_profiles_2';

  const toggleTheme = () => {
    window.localStorage.setItem('appTheme', !darkMode);
    setDarkMode(!darkMode);
  };

  const toggleFiatCurrency = (newValue) => {
    window.localStorage.setItem('appFiatCurrency', newValue);
    setActiveFiatCurrency(newValue);
  };

  useEffect(() => {
    const isDarkMode = window.localStorage.getItem('appTheme');
    const fiatCurrency = window.localStorage.getItem('appFiatCurrency');
    if (fiatCurrency) {
      setActiveFiatCurrency(fiatCurrency);
    }

    if (isDarkMode) {
      // convert to boolean
      setDarkMode(isDarkMode === 'true');
    }
  }, []);

  useEffect(() => {
    const profile = window.localStorage.getItem(KEY_ACCOUNT_PROFILE);
    //const profile = '{"account":"rDsRQWRTRrtzAgK8HH7rcCAZnWeCsJm28K","uuid":"4a3eb58c-aa97-4d48-9ab2-92d90df9a75f"}';
    if (profile) {
      setAccountProfile(JSON.parse(profile));
    }

    const profiles = window.localStorage.getItem(KEY_ACCOUNT_PROFILES);
    if (profiles) {
      setProfiles(JSON.parse(profiles));
    }
  }, []);

  const setActiveProfile = (account) => {
    const profile = profiles.find((x) => x.account === account);
    if (!profile) return;
    setAccountProfile(profile);
    window.localStorage.setItem(KEY_ACCOUNT_PROFILE, JSON.stringify(profile));
  };

  const doLogIn = (profile) => {
    setAccountProfile(profile);
    window.localStorage.setItem(KEY_ACCOUNT_PROFILE, JSON.stringify(profile));

    // const old = profiles.find(x => x.account === profile.account);
    let exist = false;
    const newProfiles = [];
    for (const p of profiles) {
      if (p.account === profile.account) {
        newProfiles.push(profile);
        exist = true;
      } else newProfiles.push(p);
    }

    if (!exist) {
      newProfiles.push(profile);
    }

    window.localStorage.setItem(
      KEY_ACCOUNT_PROFILES,
      JSON.stringify(newProfiles)
    );
    setProfiles(newProfiles);
  };

  const doLogOut = () => {
    window.localStorage.setItem(KEY_ACCOUNT_PROFILE, JSON.stringify(null));
    window.localStorage.setItem(KEY_ACCOUNT_PROFILES, JSON.stringify([]));
    setAccountProfile(null);
    setProfiles([]);
  };

  const removeProfile = (account) => {
    const newProfiles = profiles.filter(function (obj) {
      return obj.account !== account;
    });
    window.localStorage.setItem(
      KEY_ACCOUNT_PROFILES,
      JSON.stringify(newProfiles)
    );
    setProfiles(newProfiles);
  };


  useEffect(() => {
    var timer = null;
    var isRunning = false;
    var counter = 150;
    if (openLogin) {
      timer = setInterval(async () => {
        // console.log(counter + " " + isRunning, uuid);
        if (isRunning) return;
        isRunning = true;
        try {
          const res = await axios.get(`${BASE_URL}/account/login/${uuid}`);
          const ret = res?.data;
          if (ret?.profile) {
            const profile = ret.profile;
            // setOpen(true);
            setOpenLogin(false);
            setOpenWalletModal(false);
            doLogIn({...profile, wallet_type: "xaman"});
            return;
          }
        } catch (err) {}
        isRunning = false;
        counter--;
        if (counter <= 0) {
          setOpenLogin(false);
          setOpenWalletModal(false);
        }
      }, 2000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [openLogin, uuid, doLogIn]);

  const onConnectXumm = async () => {
    setOpenLogin(true);
    setConnecting(true);
    try {
      const res = await axios.post(`${BASE_URL}/account/login`);
      if (res.status === 200) {
        const uuid = res.data.data.uuid;
        const qrlink = res.data.data.qrUrl;
        const nextlink = res.data.data.next;

        setUuid(uuid);
        setQrUrl(qrlink);
        setNextUrl(nextlink);
      }
    } catch (err) {
      alert(err);
    }
    setConnecting(false);
  };

  const onCancelLoginXumm = async (xuuid) => {
    setConnecting(true);
    try {
      const res = await axios.delete(
        `${BASE_URL}/account/cancellogin/${xuuid}`
      );
      if (res.status === 200) {
      }
    } catch (err) {}
    setUuid(null);
    setConnecting(false);
  };

  const onLogoutXumm = async () => {
    setConnecting(true);
    setOpenLogin(false);
    try {
      const accountToken = accountProfile?.token;
      const accountUuid = accountProfile?.xuuid;
      const res = await axios.delete(
        `${BASE_URL}/account/logout/${accountLogin}/${accountUuid}`,
        { headers: { 'x-access-token': accountToken } }
      );
      if (res.status === 200) {
      }
    } catch (err) {}
    doLogOut();
    setUuid(null);
    setConnecting(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogin = () => {
    setOpen(false);
    onConnectXumm();
  };

  const handleLogout = () => {
    setOpen(false);
    onLogoutXumm();
  };

  const handleLoginClose = () => {
    setOpenLogin(false);
    setOpenWalletModal(false);
    onCancelLoginXumm(uuid);
    setOpenWalletModal(false);
  };

  useEffect(() => {
    function getAccountInfo() {
      if (!accountProfile || !accountProfile.account) {
        return;
      }

      const account = accountProfile.account;
      // https://api.xrpl.to/api/account/info/r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm?curr1=534F4C4F00000000000000000000000000000000&issuer1=rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz&curr2=XRP&issuer2=XRPL
      axios
        .get(
          `${BASE_URL}/account/info/${account}?curr1=XRP&issuer1=XRPL&curr2=534F4C4F00000000000000000000000000000000&issuer2=rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz`
        )
        .then((res) => {
          let ret = res.status === 200 ? res.data : undefined;
          if (ret) {
            setAccountBalance(ret.pair);
          }
        })
        .catch((err) => {
          console.log('Error on getting account pair balance info.', err);
        })
        .then(function () {
          // always executed
        });
    }
    // console.log('account_info')
    getAccountInfo();
  }, [accountProfile, sync]);

  const contextValue = useMemo(() => ({
    toggleTheme,
    darkMode,
    setDarkMode,
    accountProfile,
    setActiveProfile,
    profiles,
    removeProfile,
    doLogIn,
    doLogOut,
    setLoading,
    openSnackbar,
    sync,
    setSync,
    activeFiatCurrency,
    toggleFiatCurrency,
    open,
    setOpen,
    openLogin,
    setOpenLogin,
    openWalletModal,
    setOpenWalletModal,
    uuid,
    setUuid,
    qrUrl,
    setQrUrl,
    nextUrl,
    setNextUrl,
    accountBalance,
    setAccountBalance,
    onConnectXumm, 
    onCancelLoginXumm, 
    onLogoutXumm, 
    handleOpen,
    handleClose,
    handleLogin,
    handleLogout,
    handleLoginClose,
    connecting,
    setConnecting,
    deletingNfts,
    setDeletingNfts
  }), [
    darkMode, accountProfile, profiles, sync, activeFiatCurrency,
    open, openLogin, openWalletModal, uuid, qrUrl, nextUrl,
    accountBalance, connecting, deletingNfts
    // Add any other dependencies that should trigger a re-creation of the context value
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      <Backdrop
        sx={{ color: '#000', zIndex: (theme) => theme.zIndex.drawer + 202 }}
        open={loading}
      >
        <PuffLoader color={'#00AB55'} size={50} />
      </Backdrop>

      <Provider store={store}>{children}</Provider>
    </AppContext.Provider>
  );
}