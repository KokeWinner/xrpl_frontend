import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, TextField, IconButton, CircularProgress, Tabs, Tab, Snackbar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import DefaultPrompts from './DefaultPrompts'; // We'll create this component
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

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

const AIChat = () => {
  const [conversations, setConversations] = useState(() => {
    const savedConversations = localStorage.getItem('chatConversations');
    return savedConversations ? JSON.parse(savedConversations) : [];
  });
  const [activeConversation, setActiveConversation] = useState('new');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const terminalRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    // Save messages to localStorage whenever they change
    localStorage.setItem('chatConversations', JSON.stringify(conversations));
  }, [conversations]);

  const handleNewConversation = () => {
    setActiveConversation('new');
    setInput('');
  };

  const handleTabChange = (event, newValue) => {
    if (newValue === 'new') {
      handleNewConversation();
    } else {
      setActiveConversation(newValue);
    }
  };

  const handleSubmit = async (event, overrideInput = null) => {
    event.preventDefault();
    let submittedInput = overrideInput || input;
    
    // Add a question mark if it's not already present
    if (submittedInput.trim() && !submittedInput.trim().endsWith('?')) {
      submittedInput = submittedInput.trim() + '?';
    }

    if (submittedInput.trim() && !isLoading) {
      const userMessage = { role: 'user', content: submittedInput.trim() };
      let currentMessages = [];
      let newConversationId = null;

      setConversations(prevConversations => {
        let updatedConversations = [...prevConversations];
        if (activeConversation === 'new') {
          newConversationId = updatedConversations.length;
          updatedConversations.push({ id: newConversationId, messages: [userMessage] });
          setActiveConversation(newConversationId);
        } else {
          updatedConversations[activeConversation].messages.push(userMessage);
        }
        currentMessages = updatedConversations[newConversationId !== null ? newConversationId : activeConversation].messages;
        return updatedConversations;
      });

      setInput('');
      setIsLoading(true);
      setError(null);
      setStreamingMessage('');

      try {
        console.log('Sending request to Ollama API...');
        const response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gemma2:2b',
            messages: currentMessages,
            stream: true
          }),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          console.log('Received chunk:', chunk);

          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() !== '') {
              try {
                const parsedChunk = JSON.parse(line);
                if (parsedChunk.message && parsedChunk.message.content) {
                  accumulatedContent += parsedChunk.message.content;
                  setStreamingMessage(accumulatedContent);
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }

        console.log('Finished processing response');

        setConversations(prevConversations => {
          const updatedConversations = [...prevConversations];
          const conversationIndex = newConversationId !== null ? newConversationId : activeConversation;
          if (!updatedConversations[conversationIndex]) {
            console.error('Conversation not found:', conversationIndex);
            return prevConversations;
          }
          updatedConversations[conversationIndex].messages.push({ role: 'assistant', content: accumulatedContent });
          return updatedConversations;
        });
      } catch (error) {
        console.error('Error calling Ollama API:', error);
        let errorMessage = 'Error: Unable to get response from AI.';
        if (error.message) {
          errorMessage += ` ${error.message}`;
        }
        setError(errorMessage);
      }

      setIsLoading(false);
      setStreamingMessage('');
    }
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleCloseConversation = (event, conversationIndex) => {
    event.stopPropagation(); // Prevent tab from being selected when closing
    setConversations(prevConversations => {
      const updatedConversations = prevConversations.filter((_, index) => index !== conversationIndex);
      // If we're closing the active conversation, set the active to the previous one or 'new'
      if (activeConversation === conversationIndex) {
        setActiveConversation(updatedConversations.length > 0 ? updatedConversations.length - 1 : 'new');
      } else if (activeConversation > conversationIndex) {
        // Adjust the active conversation index if we're closing a tab before it
        setActiveConversation(activeConversation - 1);
      }
      return updatedConversations;
    });
  };

  const handlePromptClick = (promptText) => {
    // Automatically submit the prompt
    handleSubmit({ preventDefault: () => {} }, promptText);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const formatMessage = (content) => {
    console.log("Formatting message:", content);
    return (
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            console.log("Code block detected:", { inline, language: match ? match[1] : null, children });
            return !inline && match ? (
              <div style={{ position: 'relative' }}>
                <IconButton
                  onClick={() => handleCopyCode(String(children))}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                  size="small"
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
              </div>
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

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', zIndex: 1 }}>
        <Tabs 
          value={activeConversation === 'new' ? 'new' : activeConversation} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{ pointerEvents: 'auto' }}
        >
          <Tab label="New Chat" value="new" />
          {conversations.map((conv, index) => (
            <Tab
              key={conv.id}
              value={index}
              label={
                <Box display="flex" alignItems="center">
                  {`Chat ${index + 1}`}
                  <IconButton size="small" onClick={(event) => handleCloseConversation(event, index)} sx={{ ml: 1, p: 0 }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>
      <CustomScrollBox
        ref={terminalRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          backgroundColor: 'background.paper'
        }}
      >
        {activeConversation === 'new' && (
          <DefaultPrompts onPromptClick={handlePromptClick} />
        )}
        {activeConversation !== 'new' && conversations[activeConversation]?.messages.map((message, index) => (
          <Box 
            key={`message-${activeConversation}-${index}`} 
            sx={{ 
              mb: 2, 
              p: 2, 
              borderRadius: 2,
              backgroundColor: message.role === 'user' ? 'action.hover' : 'background.default',
              boxShadow: 1
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                color: message.role === 'user' ? 'primary.main' : 'secondary.main',
                mb: 0.5
              }}
            >
              {message.role === 'user' ? 'You:' : 'AI:'}
            </Typography>
            <Box>
              {formatMessage(message.content)}
            </Box>
          </Box>
        ))}
        {streamingMessage && (
          <Box 
            sx={{ 
              mb: 2, 
              p: 2, 
              borderRadius: 2,
              backgroundColor: 'background.default',
              boxShadow: 1
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                color: 'secondary.main',
                mb: 0.5
              }}
            >
              AI:
            </Typography>
            <Box>
              {formatMessage(streamingMessage)}
            </Box>
          </Box>
        )}
        {isLoading && !streamingMessage && (
          <Box display="flex" alignItems="center">
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
              AI is thinking...
            </Typography>
          </Box>
        )}
        {error && (
          <Box display="flex" alignItems="center" sx={{ color: 'error.main' }}>
            <ErrorIcon sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {error}
            </Typography>
          </Box>
        )}
      </CustomScrollBox>
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="Code copied to clipboard!"
      />
      <Box
        component="form"
        onSubmit={(e) => handleSubmit(e)}
        sx={{
          display: 'flex',
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          zIndex: 1,
          backgroundColor: 'background.paper'
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={input}
          onChange={handleInputChange}
          placeholder="Chat with AI..."
          sx={{ mr: 1, pointerEvents: 'auto' }}
          disabled={isLoading}
        />
        <IconButton 
          type="submit" 
          color="primary" 
          disabled={isLoading || !input.trim()}
          sx={{ pointerEvents: 'auto' }}
        >
          {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default AIChat;
