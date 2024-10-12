import { useContext, useEffect, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ChatPanel from "./ChatPanel";
import { Button, Stack, TextField, Menu, MenuItem, ListItemIcon, ListItemText, Tabs, Tab, Tooltip, Chip, styled } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useDispatch, useSelector } from 'react-redux';
import { selectChatOpen, toggleChatOpen } from 'src/redux/chatSlice';
import { io } from 'socket.io-client';
import { AppContext } from 'src/AppContext';
import { useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import ChatNFTPicker from './ChatNFTPicker';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // Updated Spark-themed icon
import SettingsIcon from '@mui/icons-material/Settings';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import AIChat from './AIChat'; // If you have an AIChat component, rename accordingly
import ChatSettings from './ChatSettings';
import StoreIcon from '@mui/icons-material/Store';
import Store from './Store';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Trades from './Trades';
import TerminalIcon from '@mui/icons-material/Terminal'; // Import Terminal Icon
import Terminal from './Terminal'; // Import Terminal Component

// Styled component for custom scrollbar
const CustomScrollBox = styled(Box)(({ theme }) => ({
  '&::-webkit-scrollbar': {
    width: '8px'
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.mode === 'dark' ? '#555' : '#a9a9a94d',
    borderRadius: '10px'
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'dark' ? 'darkgrey' : 'darkgrey',
    borderRadius: '10px'
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: theme.palette.mode === 'dark' ? '#a9a9a9d4' : '#a9a9a9d4',
    cursor: 'pointer'
  }
}));

const drawerWidth = 400;
const chatURL = "http://65.108.136.237:5000";  //http://65.108.136.237:5000

// Initialize socket outside the component to avoid multiple connections
const socket = io(chatURL, {
  path: "/chat",
  autoConnect: false, // We'll handle connection manually
  reconnectionAttempts: 5, // Number of reconnection attempts
  reconnectionDelay: 1000, // Delay between reconnections
});

// Emoji Picker Component with Dynamic Styling
function EmojiPicker({ onSelect }) {
  const theme = useTheme();
  
  // Determine colors based on the current theme
  const backgroundColor = theme.palette.mode === 'dark' ? '#333' : '#f0f0f0';
  const hoverColor = theme.palette.mode === 'dark' ? '#444' : '#e0e0e0';
  const emojiColor = theme.palette.mode === 'dark' ? '#fff' : '#000';

  const emojis = ["😀", "😂", "😍", "👍", "🙏", "🔥", "🎉", "❤️", "😎", "🤔", "🥳", "😇", "😭", "💪", "😜", "🥰", "🤩", "👏"];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        backgroundColor: backgroundColor,
        boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
        borderRadius: '10px',
        padding: '10px',
        maxWidth: '240px',
        zIndex: 1000,
      }}
    >
      {emojis.map((emoji, index) => (
        <Box
          key={index}
          sx={{
            fontSize: '24px',
            padding: '5px',
            cursor: 'pointer',
            userSelect: 'none',
            textAlign: 'center',
            color: emojiColor,
            '&:hover': {
              backgroundColor: hoverColor,
              borderRadius: '5px',
            },
          }}
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </Box>
      ))}
    </Box>
  );
}

// Formatted NFT Chip Component
const FormattedNFT = ({ nftLink, onRemove }) => {
  const theme = useTheme();
  const match = nftLink.match(/\[NFT: (.*?) \((.*?)\)\]/);

  if (!match) return null;

  const [_, name, tokenId] = match;

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="body2">{`${name}`}</Typography>
          <Typography variant="caption" color="textSecondary">{tokenId}</Typography>
        </Box>
      }
      arrow
    >
      <Chip
        icon={<img src="/static/crossmark.webp" alt={`${name}`} style={{ width: '16px', height: '16px' }} />}
        label={`${name}`}
        onDelete={onRemove}
        size="small"
        sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.primary.main}`,
          '& .MuiChip-label': {
            color: theme.palette.primary.main,
          },
          mr: 0.5,
          my: 0.25,
        }}
      />
    </Tooltip>
  );
};

// Custom Input Component with NFT support
const CustomInput = ({ value, onChange, onNFTRemove, onKeyPress }) => {
  const inputRef = useRef(null);
  const [localValue, setLocalValue] = useState('');
  const [nftParts, setNftParts] = useState([]);

  useEffect(() => {
    const newNftParts = value.match(/\[NFT:.*?\]/g) || [];
    setNftParts(newNftParts);
    const textParts = value.split(/\[NFT:.*?\]/g);
    setLocalValue(textParts.join(''));
  }, [value]);

  const handleChange = (e) => {
    const newTextValue = e.target.value;
    setLocalValue(newTextValue);

    const newFullValue = nftParts.join('') + newTextValue;
    onChange(newFullValue);
  };

  const handleNFTRemove = (nftLink) => {
    const newNftParts = nftParts.filter(part => part !== nftLink);
    setNftParts(newNftParts);
    const newFullValue = newNftParts.join('') + localValue;
    onChange(newFullValue);
    onNFTRemove && onNFTRemove(nftLink);
  };

  const renderNFTChips = () => {
    return nftParts.map((nftLink, index) => (
      <FormattedNFT key={index} nftLink={nftLink} onRemove={() => handleNFTRemove(nftLink)} />
    ));
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      size="small"
      value={localValue}
      onChange={handleChange}
      onKeyPress={onKeyPress}
      placeholder="Type a message..."
      multiline
      maxRows={4}
      InputProps={{
        startAdornment: (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mr: 1 }}>
            {renderNFTChips()}
          </Box>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          padding: '8px',
        },
      }}
    />
  );
};

function Chatbox() {
  const theme = useTheme();
  const backgroundColor = theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff';
  const iconBackgroundColor = theme.palette.mode === 'dark' ? '#333' : '#e0e0e0';
  const iconColor = theme.palette.mode === 'dark' ? '#fff' : '#000';

  const dispatch = useDispatch();
  const chatOpen = useSelector(selectChatOpen);
  const { accountProfile } = useContext(AppContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOption, setSelectedOption] = useState('Chatbox');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [recipient, setRecipient] = useState(null);
  const [pickerType, setPickerType] = useState('emoji');

  const emojiPickerRef = useRef(null);

  // Debugging: Clear localStorage and sessionStorage on mount
  useEffect(() => {
    // Uncomment the lines below to clear storage for debugging
    // localStorage.clear();
    // sessionStorage.clear();
  }, []);

  const handleMenuClick = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    console.log(`${option} option selected`);
    handleMenuClose();
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleClickOutside = (event) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Initialize and manage socket connection
  useEffect(() => {
    // Connect the socket
    socket.connect();

    // Socket event handlers
    const handleInit = (msg) => {
      console.log("init", msg);
      setChatHistory((previousHistory) => [...previousHistory, ...msg]);
    };

    const handleChatMessage = (msg) => {
      console.log("chat message", msg);
      setChatHistory((previousHistory) => [...previousHistory, msg]);
    };

    const handlePrivateMessage = (msg) => {
      console.log("private message", msg);
      setChatHistory((previousHistory) => [...previousHistory, msg]);
    };

    const handleSocketConnect = () => {
      console.log('Socket connected');
    };

    const handleSocketDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason !== 'io client disconnect') {
        console.log('Attempting to reconnect...');
        socket.connect();
      }
    };

    const handleSocketError = (error) => {
      console.error('Socket encountered error:', error);
    };

    // Register socket event listeners
    socket.on('init', handleInit);
    socket.on("chat message", handleChatMessage);
    socket.on("private message", handlePrivateMessage);
    socket.on('connect', handleSocketConnect);
    socket.on('disconnect', handleSocketDisconnect);
    socket.on('error', handleSocketError);

    // Cleanup on unmount
    return () => {
      socket.off('init', handleInit);
      socket.off('chat message', handleChatMessage);
      socket.off('private message', handlePrivateMessage);
      socket.off('connect', handleSocketConnect);
      socket.off('disconnect', handleSocketDisconnect);
      socket.off('error', handleSocketError);
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (accountProfile?.account && message.trim().length > 0) {
      const trimmedMessage = message.trim();
      if (recipient) {
        socket.emit("private message", {
          to: recipient,
          message: trimmedMessage,
          username: accountProfile.account,
          isPrivate: true
        });
      } else {
        socket.emit("chat message", {
          message: trimmedMessage,
          username: accountProfile.account,
          rank: "Member",
          group: "Member"
        });
      }

      setMessage('');
      setRecipient(null);
    }
  };

  const startPrivateMessage = (username) => {
    setRecipient(username);
  };

  const addEmoji = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji);
  };

  const addNFT = (nftLink) => {
    setMessage((prevMessage) => nftLink + prevMessage);
    setShowEmojiPicker(false);
  };

  const closeChat = () => {
    dispatch(toggleChatOpen());
  };

  const handleNFTRemove = (nftLink) => {
    // Logic handled within CustomInput
  };

  const handleMessageChange = (newMessage) => {
    setMessage(newMessage);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              endIcon={<ArrowDropDownIcon />}
              onClick={handleMenuClick}
              sx={{
                color: 'text.primary',
                textTransform: 'none',
                '&:active': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              {selectedOption}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleOptionSelect('Chatbox')}>
                <ListItemIcon>
                  <ChatBubbleOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Chatbox</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleOptionSelect('AI Chat')}>
                <ListItemIcon>
                  <AutoAwesomeIcon fontSize="small" /> {/* Updated Spark-themed icon */}
                  {/* <FlashOnIcon fontSize="small" /> */} {/* Alternative Spark-themed icon */}
                </ListItemIcon>
                <ListItemText>AI Chat</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleOptionSelect('Trades')}>
                <ListItemIcon>
                  <SwapHorizIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Trades</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleOptionSelect('Store')}>
                <ListItemIcon>
                  <StoreIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Store</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleOptionSelect('Terminal')}>
                <ListItemIcon>
                  <TerminalIcon fontSize="small" /> {/* Terminal Icon */}
                </ListItemIcon>
                <ListItemText>Terminal</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleOptionSelect('Settings')}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
          <IconButton
            onClick={closeChat}
            edge="end"
            sx={{
              color: 'text.primary',
              mr: 2,
              '&:active': {
                backgroundColor: 'action.selected',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <CustomScrollBox sx={{ flexGrow: 1, overflow: 'auto' }}>
        {selectedOption === 'Chatbox' && (
          <ChatPanel
            chats={chatHistory}
            onStartPrivateMessage={startPrivateMessage}
          />
        )}
        {selectedOption === 'AI Chat' && <AIChat />}
        {selectedOption === 'Trades' && <Trades />}
        {selectedOption === 'Store' && <Store />}
        {selectedOption === 'Terminal' && <Terminal />} {/* Render Terminal */}
        {selectedOption === 'Settings' && <ChatSettings />}
      </CustomScrollBox>
      {
        accountProfile?.account && selectedOption === 'Chatbox' && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            {recipient && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: theme.palette.action.selected,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    To: <span style={{ color: theme.palette.primary.main }}>{recipient}</span>
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setRecipient(null)} sx={{ color: theme.palette.text.secondary }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Stack direction="row" spacing={1} alignItems="flex-end">
              <Box sx={{ flexGrow: 1 }}>
                <CustomInput
                  value={message}
                  onChange={handleMessageChange}
                  onNFTRemove={handleNFTRemove}
                  onKeyPress={handleKeyPress}
                />
              </Box>
              <Stack direction="row" spacing={1}>
                <Box sx={{ position: 'relative' }}>
                  <IconButton
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    sx={{
                      color: showEmojiPicker ? 'primary.main' : 'text.secondary',
                      backgroundColor: showEmojiPicker ? 'action.selected' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <EmojiEmotionsIcon />
                  </IconButton>
                  {showEmojiPicker && (
                    <Box
                      ref={emojiPickerRef}
                      sx={{
                        position: 'absolute',
                        bottom: '100%',
                        right: 0,
                        zIndex: 1000,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 3,
                        p: 1,
                        mt: 1,
                      }}
                    >
                      <Tabs
                        value={pickerType}
                        onChange={(e, newValue) => setPickerType(newValue)}
                        sx={{ minHeight: 32 }}
                      >
                        <Tab label="Emoji" value="emoji" sx={{ minHeight: 32, fontSize: '0.75rem' }} />
                        <Tab label="NFT" value="nft" sx={{ minHeight: 32, fontSize: '0.75rem' }} />
                      </Tabs>
                      {pickerType === 'emoji' ? (
                        <EmojiPicker onSelect={addEmoji} />
                      ) : (
                        <ChatNFTPicker onSelect={addNFT} />
                      )}
                    </Box>
                  )}
                </Box>
                <IconButton
                  onClick={sendMessage}
                  color="primary"
                  disabled={message.trim().length === 0}
                  sx={{
                    color: message.trim().length === 0 ? 'action.disabled' : 'primary.main',
                    '&.Mui-disabled': {
                      color: 'action.disabled',
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
        )
      }
    </Box>
  );

  return (
    <SwipeableDrawer
      anchor="right"
      open={chatOpen}
      onClose={() => { }}
      onOpen={() => { }}
      disableSwipeToOpen={true}
      sx={{
        '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: 'background.default' },
      }}
    >
      {drawer}
    </SwipeableDrawer>
  );
}

export default Chatbox;
