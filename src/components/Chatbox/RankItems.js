import PsychologyIcon from '@mui/icons-material/Psychology';
import WaterIcon from '@mui/icons-material/Water';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedIcon from '@mui/icons-material/Verified';

export const ranks = [
  {
    id: 'riddler',
    name: 'Riddler',
    price: 5,
    description: 'Entry-level rank for XRP puzzle solvers',
    icon: PsychologyIcon,
    color: '#FFD700'
  },
  {
    id: 'rippler',
    name: 'Rippler',
    price: 0.0001,
    description: 'Intermediate rank for XRP enthusiasts',
    icon: WaterIcon,
    color: '#4CAF50'
  },
  {
    id: 'validator',
    name: 'Validator',
    price: 0.0001,
    description: 'Advanced rank with enhanced features',
    icon: VerifiedUserIcon,
    color: '#2196F3'
  },
  {
    id: 'escrow',
    name: 'Escrow Master',
    price: 0.0001,
    description: 'Elite rank with exclusive XRP-themed perks',
    icon: LockIcon,
    color: '#9C27B0'
  },
  {
    id: 'ledger',
    name: 'Ledger Guardian',
    price: 0.0001,
    description: 'Legendary rank for true XRP aficionados',
    icon: SecurityIcon,
    color: '#F44336'
  }
];

export const verifiedStatus = {
  id: 'verified',
  name: 'Verified',
  price: 0.0001,
  description: 'Exclusive verified status with premium benefits',
  icon: VerifiedIcon,
  color: '#1DA1F2'
};