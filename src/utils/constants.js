import ClassIcon from '@mui/icons-material/Class';
import ArtTrackIcon from '@mui/icons-material/ArtTrack';
import CollectionsIcon from '@mui/icons-material/Collections';
import DnsIcon from '@mui/icons-material/Dns';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PaymentsIcon from '@mui/icons-material/Payments';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import PaletteIcon from '@mui/icons-material/Palette';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import FacebookIcon from '@mui/icons-material/Facebook';
import CycloneIcon from '@mui/icons-material/Cyclone';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import EuroRoundedIcon from '@mui/icons-material/EuroRounded';
import CurrencyYenRoundedIcon from '@mui/icons-material/CurrencyYenRounded';
import CurrencyYuanRoundedIcon from '@mui/icons-material/CurrencyYuanRounded';
import { Icon } from '@iconify/react';
// import CurrencyXRPIcon from "@iconify/icons-tabler/currency-xrp";

export const SUPPORTED_FILE_TYPES = [
  'JPG',
  'PNG'
  // 'GIF',
  // 'SVG',
  // 'MP4',
  // 'WEBM',
  // 'WAV',
  // 'OGG',
  // 'GLB',
  // 'GLTF'
];

export const ACCOUNTS = [
  {
    id: 1,
    account: 'rKVd5WtB8ugrxaTDTbJv6pVH7WunmyryLq'
  },
  {
    id: 2,
    account: 'rEBKhngY8izMvRrgGg3Yh5zdiQgHH9cExg'
  },
  {
    id: 3,
    account: 'rwj4mN7o5niF2zqoUajKGH5rXJwdWyLWF9'
  },
  {
    id: 4,
    account: 'rQ3zXHDBM7mbZyNrUP1fGjhEfHT38dkx1v'
  },
  {
    id: 5,
    account: 'rpcmZhxthTeWoLMpro5dfRAsAmwZCrsxGK'
  }
];
export const TOP_BAR_HEIGHT_DESKTOP = 33;
export const BASIC_COLOR = '#00AB55';
export const tfTransferable = 0x00000008;
export const tfTrustLine = 0x00000004;
export const tfOnlyXRP = 0x00000002;
export const tfBurnable = 0x00000001;
export const TOKEN_FLAGS = [
  {
    label: 'Burnable',
    value: 1,
    desc: "If set, indicates that the issuer (or an entity authorized by the issuer) can destroy the object. The object's owner can always do so."
  },
  {
    label: 'OnlyXRP',
    value: 2,
    desc: 'If set, nft can only be offered or sold for XRP.'
  },
  {
    label: 'TrustLine',
    value: 4,
    desc: 'If set, indicates that the issuer wants a trustline to be automatically created.'
  },
  {
    label: 'Transferable',
    value: 8,
    desc: '	If set, indicates that this NFT can be transferred. This flag has no effect if the token is being transferred from the issuer or to the issuer.'
  }
];
export const NON_FLAGS = [6, 7, 14, 15];

export const CATEGORIES = [
  {
    title: 'NONE',
    icon: <ClassIcon />
  },
  {
    title: 'Art',
    slug: 'art',
    count: 0,
    icon: <PaletteIcon />
  },
  {
    title: 'AI Art',
    slug: 'ai-art',
    count: 0,
    icon: <PsychologyIcon />
  },
  {
    title: 'Collectibles',
    slug: 'collectibles',
    count: 0,
    icon: <CollectionsIcon />
  },
  {
    title: 'Domain Names',
    slug: 'domain-names',
    count: 0,
    icon: <DnsIcon />
  },
  {
    title: 'Gaming',
    slug: 'gaming',
    count: 0,
    icon: <SportsEsportsIcon />
  },
  {
    title: 'Music',
    slug: 'music',
    count: 0,
    icon: <LibraryMusicIcon />
  },
  {
    title: 'Photography',
    slug: 'photography',
    count: 0,
    icon: <WallpaperIcon />
  },
  {
    title: 'Sports',
    slug: 'sports',
    count: 0,
    icon: <SportsBasketballIcon />
  },
  {
    title: 'Trading Cards',
    slug: 'trading-cards',
    count: 0,
    icon: <PaymentsIcon />
  },
  {
    title: 'Utility',
    slug: 'utility',
    count: 0,
    icon: <HomeRepairServiceIcon />
  },
  {
    title: 'Virtual Worlds',
    slug: 'virtual-worlds',
    count: 0,
    icon: <ViewInArIcon />
  },
  {
    title: 'Phygital',
    slug: 'phygital',
    count: 0,
    icon: <CycloneIcon />
  }
];

export const FILTER_NFT_FLAGS = [
  {
    label: 'Buy with Mints',
    value: 1
  },
  {
    label: 'Sold & Transfer',
    value: 2
  },
  {
    label: 'On Sale',
    value: 4
  }
];

export const CURRENCY_ISSUERS = {
  USD: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B', // bitstamp
  BTC: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B', // bitstamp
  CNY: 'rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y', // ripplefox
  EUR: 'rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq', // gatehub
  JPY: 'r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN', // tokyojpy

  XRP_MD5: '84e5efeb89c4eae8f68188982dc290d8',
  USD_MD5: 'c9ac9a6c44763c1bd9ccc6e47572fd26',
  BTC_MD5: 'ce7b81b078cf2c4f6391c39de3425e54',
  CNY_MD5: '0f036e757e4aca67a2d4ae7aab638a95',
  EUR_MD5: 'd129c5dd925a53dc55448798ba718c0f',
  JPY_MD5: '52dda274a00d29232f2b860cac26e2ca',
  XRP: ''
};

export const XRP_TOKEN = {
  // 7:33 PM 04/19/2023
  md5: '84e5efeb89c4eae8f68188982dc290d8',
  name: 'XRP',
  user: 'XRP',
  issuer: 'XRPL',
  currency: 'XRP',
  ext: 'png',
  exch: '1',
  isOMCF: 'yes'
};

export const USD_TOKEN = {
  // 7:49 PM 04/19/2023
  md5: 'c9ac9a6c44763c1bd9ccc6e47572fd26',
  name: 'USD',
  user: 'Bitstamp USD',
  issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
  currency: 'USD',
  ext: 'png',
  exch: '1',
  isOMCF: 'yes'
};

export const COLLECTION_FAMILIES = [
  {
    title: 'Art',
    value: 'art',
    icon: <PhotoLibraryIcon />
  },
  {
    title: 'Social',
    value: 'social',
    icon: <FacebookIcon />
  }
];

export const NFToken = {
  // 11:42 AM 11/18/2022
  PREMINT: 8, // Submitted the NFTokenMint transaction but not found NFTokenID yet
  SELL_WITH_MINT: 16, // NFTs sell with MINT have this status flag, only in Random & Sequence collections.
  SELL_WITH_MINT_BULK: 17, // NFTs sell with MINT have this status flag, only in Bulk collections.

  PREOFFER: 24, // Submitted the NFTokenCreateOffer transaction but not found SellOfferID yet

  FREE: 32,

  BURNT: 40,

  ERROR_BASE: 130,
  PREMINT_E1: 131, // Failed to submit the NFTokenMint transaction
  PREMINT_E2: 132, // Exception occured to submit the NFTokenMint transaction
  PREMINT_E3: 133, // Tried to find out NFTokenID but failed, only used in mint one
  PREMINT_E3r1: 134, // Tried to find out NFTokenID but failed again

  PREOFFER_E1: 141, // Failed to submit the NFTokenCreateOffer transaction
  PREOFFER_E2: 142, // Exception occured to submit the NFTokenCreateOffer transaction
  PREOFFER_E3: 143 // Tried to find out SellOfferID but failed
};

export const Activity = {
  // 08:58 AM 12/20/2022
  LOGIN: 1,
  LOGOUT: 2,
  UPDATE_PROFILE: 3,

  CREATE_COLLECTION: 4,
  UPDATE_COLLECTION: 7,
  IMPORT_COLLECTION: 9,

  MINT_BULK: 10, // Lazy mint mode, ie. 10k NFTs

  BUY_MINT: 12,
  BUY_RANDOM_NFT: 13,
  BUY_BULK_NFT: 14,
  BUY_SEQUENCE_NFT: 15,

  // Tx parse section
  CREATE_SELL_OFFER: 21, // Owner, NFTokenCreateOffer, status: "created", flags: 1
  CREATE_BUY_OFFER: 22, // Buyer, NFTokenCreateOffer, status: "created", flags: 0

  CANCEL_SELL_OFFER: 23, // Owner, NFTokenCancelOffer, status: "deleted", flags: 1
  CANCEL_BUY_OFFER: 24, // Buyer, NFTokenCancelOffer, status: "deleted", flags: 0

  ACCEPT_BUY_OFFER: 25, // Owner, NFTokenAcceptOffer, status: "deleted", flags: 0
  ACCEPT_SELL_OFFER: 26, // Buyer, NFTokenAcceptOffer, status: "deleted", flags: 1

  OWNER_ACCPETED_YOUR_BUY_OFFER: 27,
  BUYER_ACCEPTED_YOUR_SELL_OFFER: 28,
  YOU_RECEIVED_A_NFT: 29, // Buyer accepted a NFT by Buy Offer or Sell Offer

  //
  MINT_NFT: 31,
  BURN_NFT: 32, // Owner,

  // Broker
  BROKER_ACCEPTED_YOUR_BUY_OFFER: 35,
  BROKER_ACCEPTED_YOUR_SELL_OFFER: 36,

  //
  SET_NFT_MINTER: 41, // AccountSet

  FUND_CREATOR: 51, // Minter account funded to Collection creator.
  REFUND_BUYER: 52, // Refund Mint amount to the buyer.

  GAVE_MINTS_TO_USER: 88,

  REMOVE_A_COLLECTION: 129,
  SET_COLLECTION_TRUSTLINES: 130
};

export const Mint = {
  // 6:41 AM 11/26/2022
  BUY: 1,
  PAID: 2,
  CANCEL: 3,
  REMOVE: 4,

  // Fund to creator
  PENDING: 9,
  FUND: 10,
  FUNDED: 11,

  // Refund to Buyer
  REFUND: 21,
  REFUNDED: 22,

  ERROR_BASE: 80,
  FUND_E1: 81,
  FUND_E2: 82,

  REFUND_E1: 91,
  REFUND_E2: 92
};

export const CollectionListType = {
  // 4:22 PM 12/07/2022
  ALL: 1,
  MINE: 2,
  CATEGORY: 3,
  LANDING: 4
};

const BG_FILES = [
  'bay1.png',
  'Fractal_1.png',
  'bay2.jpg',
  'Fractal_2.png',
  'bay3.png',
  'Fractal_3.png',
  'bay4.jpg',
  'Fractal_4.png',
  'mmc1.png',
  'Fractal_5.png',
  'mmc2.png',
  'Fractal_6.png',
  'mmc3.png',
  'Fractal_7.png',
  'mmc4.jpg',
  'Fractal_8.png',
  'mmc5.png',
  'Fractal_9.png',
  'Fractal_10.png',
  'Fractal_11.png'
];

export function getRandomBG() {
  let rand = Math.random() * BG_FILES.length;

  rand = Math.floor(rand);

  return BG_FILES[rand];
}

export function getMinterName(minter) {
  switch (minter) {
    case 'rzVH4G8GjTbvXhxJHvnri3MJ1aqf9WFGE':
      return 'XRPNFT 1';
      break;
    case 'rw94PYuzGQknjTsi8GWn8Cgk16TZuVn6Wn':
      return 'XRPNFT 2';
      break;
    case 'rESvnQrpWVho8kEiHEVKXMBoiUzdkYVtDL':
      return 'XRPNFT 3';
      break;
    case 'r3AGSrv9SHzzhe5BxqG8sFiRSxNs26tEVs':
      return 'XRPNFT 4';
      break;
    case 'rwDcDemfFpnw4kD7mVz35jVXxBfY4EePbn':
      return 'XRPNFT 5';
      break;
    default:
      return '';
      break;
  }
}

export function statusToString(status) {
  for (const [key, value] of Object.entries(NFToken)) {
    if (value === status) return key;
  }
  return 'NONE';
}

export const defaultCurrencyIconProps = {
  sx: {
    fontSize: 18
  }
};

export const currencyIcons = {
  USD: <AttachMoneyRoundedIcon {...defaultCurrencyIconProps} />,
  EUR: <EuroRoundedIcon {...defaultCurrencyIconProps} />,
  JPY: <CurrencyYenRoundedIcon {...defaultCurrencyIconProps} />,
  CNY: <CurrencyYuanRoundedIcon {...defaultCurrencyIconProps} />,
  XRP: <Icon icon="tabler:currency-xrp" width={18} height={18}/>
};

export const currencySymbols = {
  USD: '$ ',
  EUR: '€ ',
  JPY: '¥ ',
  CNY: '¥ ',
  XRP: '✕ '
};

export const currencyConfig = {
  availableFiatCurrencies: ['XRP', 'USD', 'EUR', 'JPY', 'CNY'],
  activeFiatCurrency: 'USD'
};

export const persistJWT = 'UDnaYthx9EJaulSkvfH5qE0q98tp3twQ'