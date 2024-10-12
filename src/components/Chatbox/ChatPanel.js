import {
  Stack,
  Avatar,
  styled,
  Paper,
  Typography,
  Tooltip,
  Box,
  useTheme,
  tooltipClasses,
  IconButton,
  Link,
  alpha,
} from '@mui/material';
import { parseISO } from 'date-fns';
import {
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AppContext } from 'src/AppContext';
import UserSummary from './UserSummary';
import { rankGlowEffect, lightningEffect, activeRankColors } from './RankStyles';
import NFTDisplay from './NFTDisplay';
import Trade from './Trade';

const CustomWidthTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
    padding: '0 !important',
  }
});

const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 0) {
    return 'Just now';
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}hr`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)}d`;
  }
};

const CustomScrollBox = styled(Stack)(({ theme }) => ({
  '&::-webkit-scrollbar': {
    width: '8px'
  },
  '&::-webkit-scrollbar-track': {
    background: '#a9a9a94d',
    borderRadius: '10px'
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'darkgrey',
    borderRadius: '10px'
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#a9a9a9d4',
    cursor: 'pointer'
  }
}));

const ranks = {
  riddler: {
    id: 'riddler',
    name: 'Riddler',
    price: 5,
    description: 'Entry-level rank for XRP puzzle solvers',
    color: '#FFD700'
  },
  rippler: {
    id: 'rippler',
    name: 'Rippler',
    price: 0.0001,
    description: 'Intermediate rank for XRP enthusiasts',
    color: '#4CAF50'
  },
  validator: {
    id: 'validator',
    name: 'Validator',
    price: 0.0001,
    description: 'Advanced rank with enhanced features',
    color: '#2196F3'
  },
  escrow: {
    id: 'escrow',
    name: 'Escrow Master',
    price: 0.0001,
    description: 'Elite rank with exclusive XRP-themed perks',
    color: '#9C27B0'
  },
  ledger: {
    id: 'ledger',
    name: 'Ledger Guardian',
    price: 0.0001,
    description: 'Legendary rank for true XRP aficionados',
    color: '#F44336'
  },
  verified: {
    id: 'verified',
    name: 'Verified',
    price: 0.0001,
    description: 'Exclusive verified status with premium benefits',
    color: '#1DA1F2'
  }
};

const ChatPanel = ({ chats, onStartPrivateMessage }) => {
  const theme = useTheme();
  const { accountProfile } = useContext(AppContext);
  const chatContainerRef = useRef(null);
  const [userImages, setUserImages] = useState({});
  const [activeRanks, setActiveRanks] = useState({});
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [trader, setTrader] = useState({});


  // Inject lightningEffect into the document's head
  const styleElement = document.createElement('style');
  styleElement.textContent = lightningEffect;
  document.head.appendChild(styleElement);

  const truncateString = (str) => str.slice(0, 12) + (str.length > 12 ? '...' : '');

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  // Add this console.log to check if chats are being received
  console.log('Chats received in ChatPanel:', chats);

  useEffect(() => {
    const fetchUserImages = async () => {
      const uniqueUsers = [...new Set(chats.map((chat) => chat.username))];
      const imagePromises = uniqueUsers.map(async (account) => {
        try {
          const response = await axios.get(
            `http://65.108.136.237:5000/api/set-user-image?account=${account}`  //http://65.108.136.237:5000
          );
          if (response.data.user) {
            const user = response.data.user;
            return {
              [account]: user.imageUrl
                ? `https://s2.xrpnft.com/d1/${user.imageUrl}`
                : user.nftTokenId
                  ? `https://s2.xrpnft.com/d1/${user.nftTokenId}`
                  : null
            };
          } else {
            console.log(`No user data found for ${account}`);
            return { [account]: null };
          }
        } catch (error) {
          console.error(`Error fetching image for ${account}:`, error.message);
          return { [account]: null };
        }
      });

      const images = await Promise.all(imagePromises);
      setUserImages(Object.assign({}, ...images));
    };

    if (chats.length > 0) {
      fetchUserImages();
    }
  }, [chats]);

  useEffect(() => {

    async function fetchActiveRanks() {
      const res = await axios.get('http://65.108.136.237:5000/api/fetch-active-ranks'); //http://65.108.136.237:5000
      setActiveRanks(res.data);
    }

    fetchActiveRanks();

  }, [])

  return (
    <CustomScrollBox
      ref={chatContainerRef}
      gap={1} // Reduced gap from 2 to 1
      sx={{
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse',
        padding: 1, // Reduced padding from 2 to 1
        backgroundColor: alpha(theme.palette.background.default, 0.8), // Semi-transparent background
      }}
    >
      {Array.isArray(chats) && chats.length > 0 ? (
        chats
          .filter(
            (chat) =>
              !chat.isPrivate ||
              chat.username === accountProfile?.account ||
              chat.recipient === accountProfile?.account
          )
          .reverse()
          .map((chat, index) => {
            const parsedTime = parseISO(chat.timestamp);
            const timeAgo = formatTimeAgo(parsedTime);

            const privateMessageRecipient = chat.isPrivate
              ? chat.username === accountProfile?.account
                ? chat.recipient
                : chat.username
              : chat.username;

            const displayUsername = truncateString(chat.username);
            const displayRecipient = truncateString(privateMessageRecipient);

            const isCurrentUser = chat.username === accountProfile?.account;
            const recipientRankColor = activeRankColors[activeRanks[privateMessageRecipient]] || '#808080';

            // Parse NewsBot message
            let newsData = null;
            if (chat.username === 'NewsBot') {
              try {
                newsData = JSON.parse(chat.message);
              } catch (error) {
                console.error('Error parsing NewsBot message:', error);
              }
            }

            const isVerified = activeRanks[chat.username] === 'verified';

            return (
              <Paper
                key={index}
                elevation={1} // Reduced elevation from 2 to 1
                sx={{
                  backgroundColor: isCurrentUser
                    ? alpha(theme.palette.primary.main, 0.1)
                    : theme.palette.background.paper,
                  borderRadius: 1, // Reduced border radius from 2 to 1
                  p: 1, // Reduced padding from 2 to 1
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)', // Reduced transform from -2px to -1px
                    boxShadow: theme.shadows[2], // Reduced shadow from 4 to 2
                  }
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Avatar
                    alt={chat.username}
                    src={userImages[chat.username] || '/static/crossmark.webp'}
                    sx={{
                      width: 32, // Reduced size from 40 to 32
                      height: 32, // Reduced size from 40 to 32
                      border: `3px solid ${activeRankColors[activeRanks[chat.username]] || '#808080'}`, // Circle border according to rank, default to gray
                      boxShadow: `0 0 15px ${activeRankColors[activeRanks[chat.username]] || '#808080'}`, // Glow effect similar to UserSummary, default to gray
                    }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CustomWidthTooltip
                        title={
                          <UserSummary
                            user={chat}
                            activeColor={activeRankColors[activeRanks[chat.username]] || theme.palette.text.primary}
                            rankName={ranks[activeRanks[chat.username]]?.name}
                            rank={activeRanks[chat.username]}
                            handleTrade = {() => {
                              setTrader(chat);
                              setTradeModalOpen(true);
                            }}
                          />} arrow placement="right">
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 'bold',
                            color: activeRankColors[activeRanks[chat.username]] || '#808080', // Default to gray if no rank
                            textShadow: rankGlowEffect(theme)[chat.rank] || 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {displayUsername}
                          {isVerified && (
                            <VerifiedIcon
                              sx={{
                                fontSize: '1rem',
                                ml: 0.5,
                                color: '#1DA1F2', // Twitter blue color for verified icon
                              }}
                            />
                          )}
                          {chat.isPrivate && (
                            <>
                              {' → '}
                              <span style={{ color: recipientRankColor }}>
                                {displayRecipient}
                              </span>
                            </>
                          )}
                        </Typography>
                      </CustomWidthTooltip>
                      {chat.username !== accountProfile?.account && (
                        <Tooltip title="Send private message" arrow>
                          <IconButton
                            size="small"
                            onClick={() => onStartPrivateMessage(privateMessageRecipient)}
                            sx={{
                              padding: 0,
                              color: theme.palette.text.secondary,
                              '&:hover': {
                                color: theme.palette.primary.main
                              }
                            }}
                          >
                            <ChatBubbleOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                    {newsData ? (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {newsData.title}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {newsData.summary !== 'No summary available'
                            ? newsData.summary
                            : 'No summary available.'}
                        </Typography>
                        <Link href={newsData.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>
                            Read more at {newsData.sourceName}
                          </Typography>
                        </Link>
                        {newsData.sentiment !== 'Unknown' && (
                          <Typography
                            variant="caption"
                            sx={{
                              ml: 1,
                              color:
                                newsData.sentiment === 'Bullish'
                                  ? 'green'
                                  : newsData.sentiment === 'Bearish'
                                    ? 'red'
                                    : 'inherit'
                            }}
                          >
                            • {newsData.sentiment}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography
                        variant="body2" // Changed from body1 to body2
                        sx={{
                          mt: 0.5, // Reduced margin top from 1 to 0.5
                          color: chat.isPrivate
                            ? theme.palette.secondary.main
                            : theme.palette.text.primary,
                          lineHeight: 1.4, // Reduced line height from 1.6 to 1.4
                        }}
                      >
                        {chat.message.split(/(\[NFT:.*?\])/).map((part, i) => {
                          if (part.startsWith('[NFT:')) {
                            return <NFTDisplay key={i} nftLink={part} />;
                          }
                          return part;
                        })}
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      opacity: 0.8,
                      fontStyle: 'italic',
                    }}
                  >
                    {timeAgo}
                  </Typography>
                </Stack>
              </Paper>
            );
          })
      ) : (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 2, fontStyle: 'italic' }}>
          No messages to display.
        </Typography>
      )}
      <Trade
        open={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        tradePartner={trader} // This is the user profile being viewed
      />
    </CustomScrollBox>
  );
};

export default ChatPanel;
