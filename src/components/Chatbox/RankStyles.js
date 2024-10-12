export const rankColors = (theme) => ({
  Member: theme.palette.grey[500],
  VIP: theme.palette.mode === 'dark' ? '#FFD700' : '#DAA520',
  AQUA: theme.palette.mode === 'dark' ? '#00CED1' : '#20B2AA',
  NOVA: theme.palette.mode === 'dark' ? '#FF69B4' : '#DB7093',
  Moderator: theme.palette.mode === 'dark' ? '#9370DB' : '#8A2BE2',
  Admin: theme.palette.mode === 'dark' ? '#FF4500' : '#DC143C',
  Titan: 'linear-gradient(90deg, #4B0082 0%, #0000FF 50%, #800080 100%)',
  Legendary: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FF4500 100%)',
  Developer: theme.palette.primary.dark,
  Bot: theme.palette.info.main
});

export const activeRankColors = {
  riddler: '#FFD700',
  rippler: '#4CAF50',
  validator: '#2196F3',
  escrow: '#9C27B0',
  ledger: '#F44336',
  verified: '#1DA1F2'
};

export const rankGlowEffect = (theme) => ({
  Member: 'none',
  VIP: `0 0 5px ${theme.palette.mode === 'dark' ? '#FFD700' : '#DAA520'}`,
  AQUA: `0 0 5px ${theme.palette.mode === 'dark' ? '#00CED1' : '#20B2AA'}`,
  NOVA: `0 0 5px ${theme.palette.mode === 'dark' ? '#FF69B4' : '#DB7093'}`,
  Moderator: `0 0 5px ${theme.palette.mode === 'dark' ? '#9370DB' : '#8A2BE2'}`,
  Admin: `0 0 5px ${theme.palette.mode === 'dark' ? '#FF4500' : '#DC143C'}`,
  Titan: '0 0 8px #0000FF',
  Legendary: '0 0 8px #FFA500',
  Developer: `0 0 5px ${theme.palette.primary.dark}`,
  Bot: `0 0 5px ${theme.palette.info.main}`
});

export const lightningEffect = `
  @keyframes lightning {
    0% { background-position: 0 0, 0 0, 0 0, 0 0; }
    50% { background-position: 100% 100%, 100% 100%, 100% 100%, 100% 100%; }
    100% { background-position: 0 0, 0 0, 0 0, 0 0; }
  }
`;