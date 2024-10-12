import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Container,
  Snackbar
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import CryptoJS from 'crypto-js';
import { Client, Wallet } from 'xrpl';
import { styled } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// Styled component for custom scrollbar
const CustomScrollBox = styled(Box)(({ theme }) => ({
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

const Terminal = () => {
  // State Variables
  const [walletInfo, setWalletInfo] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddWalletDialog, setOpenAddWalletDialog] = useState(false);
  const [seedInput, setSeedInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
  const [openHelpDialog, setOpenHelpDialog] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [confirmEncryptionPassword, setConfirmEncryptionPassword] = useState('');
  const [showEncryptionPrompt, setShowEncryptionPrompt] = useState(false);
  const [openAddTokenDialog, setOpenAddTokenDialog] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenIssuer, setTokenIssuer] = useState('');
  const [customTokens, setCustomTokens] = useState([]);

  // New state for search query
  const [searchQuery, setSearchQuery] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Ref for scrolling
  const terminalRef = useRef(null);

  // Effect to handle scrolling to the bottom when content changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [walletInfo, balance, customTokens, error]);

  // Function to Generate XRP Wallet
  const generateXrpWallet = async () => {
    setLoading(true);
    setError(null);
    setWalletInfo(null);
    setBalance(null);
    let client;
    try {
      client = new Client('wss://s.altnet.rippletest.net:51233');
      console.log('Connecting to XRPL...');
      await client.connect();
      console.log('Connected. Generating wallet...');

      const wallet = Wallet.generate();
      console.log('Wallet generated:', wallet);

      setWalletInfo({
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        classicAddress: wallet.classicAddress,
        seed: wallet.seed
      });

      setBalance(0); // Set initial balance to 0 for new wallet
      encryptWallet(wallet);
    } catch (error) {
      console.error('Error generating XRP wallet:', error);
      setError(`Failed to generate XRP wallet: ${error.message}`);
    } finally {
      if (client && client.isConnected()) {
        console.log('Disconnecting from XRPL...');
        await client.disconnect();
      }
      setLoading(false);
    }
  };

  // Function to Fund Wallet
  const fundWallet = async () => {
    if (!walletInfo) return;
    setLoading(true);
    setError(null);
    let client;
    try {
      client = new Client('wss://s.altnet.rippletest.net:51233');
      await client.connect();
      const fundResult = await client.fundWallet(walletInfo);
      console.log('Funding result:', fundResult);
      setBalance(Number(fundResult.balance));
    } catch (error) {
      console.error('Error funding wallet:', error);
      setError(`Failed to fund wallet: ${error.message}`);
    } finally {
      if (client && client.isConnected()) {
        await client.disconnect();
      }
      setLoading(false);
    }
  };

  // Function to Refresh Balance
  const refreshBalance = async () => {
    if (!walletInfo) return;
    setLoading(true);
    setError(null);
    let client;
    try {
      client = new Client('wss://s.altnet.rippletest.net:51233');
      await client.connect();
      const accountInfo = await client.request({
        command: 'account_info',
        account: walletInfo.classicAddress,
        ledger_index: 'validated'
      });
      const newBalance = Number(accountInfo.result.account_data.Balance) / 1000000; // Convert drops to XRP
      setBalance(newBalance);
    } catch (error) {
      console.error('Error refreshing balance:', error);
      setError(`Failed to refresh balance: ${error.message}`);
    } finally {
      if (client && client.isConnected()) {
        await client.disconnect();
      }
      setLoading(false);
    }
  };

  // Handlers for Adding Wallet
  const handleAddWallet = () => {
    setOpenAddWalletDialog(true);
  };

  const handleCloseAddWalletDialog = () => {
    setOpenAddWalletDialog(false);
    setSeedInput('');
  };

  const handleAddWalletSubmit = async () => {
    setLoading(true);
    setError(null);
    let client;
    try {
      const wallet = Wallet.fromSeed(seedInput);
      client = new Client('wss://s.altnet.rippletest.net:51233');
      await client.connect();
      const accountInfo = await client.request({
        command: 'account_info',
        account: wallet.classicAddress,
        ledger_index: 'validated'
      });
      const newBalance = Number(accountInfo.result.account_data.Balance) / 1000000; // Convert drops to XRP

      setWalletInfo({
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        classicAddress: wallet.classicAddress,
        seed: wallet.seed
      });
      setBalance(newBalance);
      handleCloseAddWalletDialog();
    } catch (error) {
      console.error('Error adding wallet:', error);
      setError(`Failed to add wallet: ${error.message}`);
    } finally {
      if (client && client.isConnected()) {
        await client.disconnect();
      }
      setLoading(false);
    }
  };

  // Handlers for Authentication
  const handlePasswordSubmit = () => {
    if (password === 'secret123') {
      setIsAuthenticated(true);
      setShowPasswordPrompt(false);
      setShowEncryptionPrompt(true); // Show encryption password prompt after authentication
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleEncryptionPasswordSubmit = () => {
    if (encryptionPassword !== confirmEncryptionPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    if (encryptionPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setError(null); // Clear any previous errors
    setShowEncryptionPrompt(false);
    generateXrpWallet();
  };

  // Encryption Functions
  const encryptWallet = (walletInfo) => {
    try {
      const encryptedWallet = CryptoJS.AES.encrypt(
        JSON.stringify(walletInfo),
        encryptionPassword
      ).toString();
      localStorage.setItem('encryptedWallet', encryptedWallet);
    } catch (error) {
      console.error('Error encrypting wallet:', error);
      setError('Failed to encrypt wallet. Please try again.');
    }
  };

  const decryptWallet = () => {
    const encryptedWallet = localStorage.getItem('encryptedWallet');
    if (encryptedWallet) {
      try {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedWallet, encryptionPassword);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedText) {
          throw new Error('Decryption failed. Possibly incorrect encryption password.');
        }
        return JSON.parse(decryptedText);
      } catch (error) {
        console.error('Error decrypting wallet:', error);
        setError('Failed to decrypt wallet. Please check your encryption password.');
        return null;
      }
    }
    return null;
  };

  // Handlers for Help Dialog
  const handleOpenHelpDialog = () => {
    setOpenHelpDialog(true);
  };

  const handleCloseHelpDialog = () => {
    setOpenHelpDialog(false);
  };

  // Handlers for Add Token Dialog
  const handleOpenAddTokenDialog = () => {
    setOpenAddTokenDialog(true);
  };

  const handleCloseAddTokenDialog = () => {
    setOpenAddTokenDialog(false);
    setTokenSymbol('');
    setTokenIssuer('');
  };

  const handleAddToken = () => {
    if (tokenSymbol && tokenIssuer) {
      setCustomTokens([...customTokens, { symbol: tokenSymbol, issuer: tokenIssuer }]);
      handleCloseAddTokenDialog();
    } else {
      setError('Please provide both Token Symbol and Token Issuer Address.');
    }
  };

  // Effect to Decrypt or Generate Wallet on Authentication
  useEffect(() => {
    if (isAuthenticated && !showEncryptionPrompt) {
      const decryptedWallet = decryptWallet();
      if (decryptedWallet) {
        setWalletInfo(decryptedWallet);
        refreshBalance();
      } else {
        generateXrpWallet();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, showEncryptionPrompt]);

  // Handler for Search Action
  const handleSearch = () => {
    // Implement your search logic here
    console.log('Search Query:', searchQuery);
    // Example: Filter tokens based on the search query
    // You can customize this based on your application's requirements
  };

  // Handler to Copy Text
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Function to Format Messages with Markdown and Syntax Highlighting
  const formatMessage = (content) => {
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <Box position="relative">
                <IconButton
                  onClick={() => handleCopy(String(children))}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                  size="small"
                  aria-label="Copy Code"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
                <SyntaxHighlighter
                  style={atomDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </Box>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // Conditional Rendering for Password Prompt
  if (showPasswordPrompt) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">Welcome to XRPL Terminal</Typography>
            <IconButton onClick={handleOpenHelpDialog} color="primary" aria-label="Open Help Dialog">
              <HelpIcon />
            </IconButton>
          </Box>
          <Typography variant="subtitle1" sx={{ mb: 4 }}>
            XRP Ledger's fastest bot to trade any token on the XRPL.
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Enter Password to Access Terminal
          </Typography>
          <TextField
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            aria-label="Password Input"
          />
          <Button variant="contained" onClick={handlePasswordSubmit} fullWidth aria-label="Submit Password">
            Submit
          </Button>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Container>
    );
  }

  // Conditional Rendering for Encryption Password Prompt
  if (showEncryptionPrompt) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Set Encryption Password
          </Typography>
          <TextField
            type="password"
            value={encryptionPassword}
            onChange={(e) => setEncryptionPassword(e.target.value)}
            label="Encryption Password"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            aria-label="Encryption Password Input"
          />
          <TextField
            type="password"
            value={confirmEncryptionPassword}
            onChange={(e) => setConfirmEncryptionPassword(e.target.value)}
            label="Confirm Encryption Password"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            aria-label="Confirm Encryption Password Input"
          />
          <Button variant="contained" onClick={handleEncryptionPasswordSubmit} fullWidth aria-label="Set Encryption Password">
            Set Password
          </Button>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Container>
    );
  }

  // Main Terminal UI with Search Bar at the Bottom
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // Ensures the container takes full viewport height
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Welcome to XRPL Terminal</Typography>
          <IconButton onClick={handleOpenHelpDialog} color="primary" aria-label="Open Help Dialog">
            <HelpIcon />
          </IconButton>
        </Box>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          XRP Ledger's fastest bot to trade any token on the XRPL.
        </Typography>
      </Box>

      {/* Main Content Area */}
      <CustomScrollBox
        ref={terminalRef}
        sx={{
          flexGrow: 1,
          p: 1, // Reduced padding to minimize space
          backgroundColor: 'background.paper',
        }}
      >
        {loading ? (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button variant="contained" onClick={generateXrpWallet} aria-label="Retry Wallet Generation">
              Try Again
            </Button>
          </Box>
        ) : walletInfo ? (
          <Box
            sx={{
              p: 1, // Reduced padding
              border: '1px solid #ccc',
              borderRadius: 2,
              maxWidth: '100%',
              wordBreak: 'break-all',
              mb: 1, // Reduced margin-bottom
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Classic Address:</strong> {walletInfo.classicAddress}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Seed:</strong> {walletInfo.seed}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Balance:</strong> {balance !== null ? `${balance} XRP` : 'Unknown'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Button variant="contained" onClick={fundWallet} aria-label="Fund Wallet">
                Fund Wallet
              </Button>
              <Button variant="contained" onClick={generateXrpWallet} aria-label="Generate New Wallet">
                Generate New Wallet
              </Button>
              <Button variant="contained" onClick={refreshBalance} aria-label="Refresh Balance">
                Refresh Balance
              </Button>
              <Button variant="contained" onClick={handleAddWallet} aria-label="Add Wallet">
                Add Wallet
              </Button>
              <Button variant="contained" onClick={handleOpenAddTokenDialog} aria-label="Add Tokens">
                Tokens
              </Button>
            </Box>
            {customTokens.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="h6">Custom Tokens:</Typography>
                {customTokens.map((token, index) => (
                  <Typography key={index} variant="body2">
                    {token.symbol} - Issuer: {token.issuer}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="warning.main">
            Wallet generation completed, but no information was returned. Check console for details.
          </Typography>
        )}
      </CustomScrollBox>

      {/* Search Bar at the Bottom */}
      <Box
        sx={{
          borderTop: '1px solid #ccc',
          pt: 0.5, // Reduced top padding
          pb: 0.5, // Reduced bottom padding
          mt: 'auto', // Pushes the search bar to the bottom
          backgroundColor: 'background.paper',
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} edge="end" aria-label="Search">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Add Wallet Dialog */}
      <Dialog open={openAddWalletDialog} onClose={handleCloseAddWalletDialog}>
        <DialogTitle>Add Wallet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="seed"
            label="Wallet Seed"
            type="text"
            fullWidth
            variant="standard"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            inputProps={{ style: { wordBreak: 'break-all' } }}
            aria-label="Wallet Seed Input"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddWalletDialog} aria-label="Cancel Add Wallet">
            Cancel
          </Button>
          <Button onClick={handleAddWalletSubmit} variant="contained" aria-label="Add Wallet">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Token Dialog */}
      <Dialog open={openAddTokenDialog} onClose={handleCloseAddTokenDialog}>
        <DialogTitle>Add Custom Token</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="tokenSymbol"
            label="Token Symbol"
            type="text"
            fullWidth
            variant="standard"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            aria-label="Token Symbol Input"
          />
          <TextField
            margin="dense"
            id="tokenIssuer"
            label="Token Issuer Address"
            type="text"
            fullWidth
            variant="standard"
            value={tokenIssuer}
            onChange={(e) => setTokenIssuer(e.target.value)}
            inputProps={{ style: { wordBreak: 'break-all' } }}
            aria-label="Token Issuer Address Input"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddTokenDialog} aria-label="Cancel Add Token">
            Cancel
          </Button>
          <Button onClick={handleAddToken} variant="contained" aria-label="Add Token">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={openHelpDialog} onClose={handleCloseHelpDialog}>
        <DialogTitle>XRPL Terminal Help</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Welcome to the XRPL Terminal! Here's a quick guide to get you started:
          </Typography>
          <Typography variant="body2" paragraph>
            1. Generate New Wallet: Creates a new XRP wallet for you.
          </Typography>
          <Typography variant="body2" paragraph>
            2. Fund Wallet: Adds test XRP to your wallet (only works on testnet).
          </Typography>
          <Typography variant="body2" paragraph>
            3. Refresh Balance: Updates your wallet's balance.
          </Typography>
          <Typography variant="body2" paragraph>
            4. Add Wallet: Allows you to import an existing wallet using its seed.
          </Typography>
          <Typography variant="body1" paragraph>
            Remember to keep your wallet seed safe and never share it with anyone!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHelpDialog} aria-label="Close Help Dialog">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Copy Success */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="Text copied to clipboard!"
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={() => setCopySuccess(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default Terminal;
