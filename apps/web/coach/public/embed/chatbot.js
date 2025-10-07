(function() {
  'use strict';

  // Get coach ID from script tag
  const scriptTag = document.currentScript;
  const coachID = scriptTag.getAttribute('data-coach-id');

  if (!coachID) {
    console.error('Next Level Coach AI Chatbot: data-coach-id attribute is required');
    return;
  }

  // Configuration
  const config = {
    coachID: coachID,
    // Use the origin of where the script is loaded from (your Next.js frontend)
    apiBaseURL: scriptTag.src.split('/embed/')[0], // Extracts base URL from script src
    primaryColor: scriptTag.getAttribute('data-color') || '#DF69FF',
    position: scriptTag.getAttribute('data-position') || 'bottom-right', // bottom-right, bottom-left
    greeting: scriptTag.getAttribute('data-greeting') || 'Hi! How can I help you today?'
  };

  // CSS Styles
  const styles = `
    .nlc-chatbot-container {
      position: fixed;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    .nlc-chatbot-container.bottom-right {
      bottom: 20px;
      right: 20px;
    }

    .nlc-chatbot-container.bottom-left {
      bottom: 20px;
      left: 20px;
    }

    .nlc-chatbot-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${config.primaryColor} 0%, #B339D4 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .nlc-chatbot-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }

    .nlc-chatbot-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .nlc-chatbot-window {
      position: absolute;
      bottom: 80px;
      width: 380px;
      height: 600px;
      background: linear-gradient(to bottom right, #1a1a1a, #0d0d0d);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      border: 1px solid #373535;
      display: none;
      flex-direction: column;
      overflow: hidden;
    }

    .nlc-chatbot-container.bottom-right .nlc-chatbot-window {
      right: 0;
    }

    .nlc-chatbot-container.bottom-left .nlc-chatbot-window {
      left: 0;
    }

    .nlc-chatbot-window.open {
      display: flex;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .nlc-chatbot-header {
      padding: 20px;
      background: linear-gradient(135deg, ${config.primaryColor} 0%, #B339D4 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nlc-chatbot-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .nlc-chatbot-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nlc-chatbot-close:hover {
      opacity: 0.8;
    }

    .nlc-chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: rgba(0, 0, 0, 0.3);
    }

    .nlc-chatbot-message {
      margin-bottom: 16px;
      display: flex;
      gap: 12px;
    }

    .nlc-chatbot-message.user {
      flex-direction: row-reverse;
    }

    .nlc-chatbot-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nlc-chatbot-message.assistant .nlc-chatbot-avatar {
      background: linear-gradient(135deg, ${config.primaryColor} 0%, #B339D4 100%);
    }

    .nlc-chatbot-message.user .nlc-chatbot-avatar {
      background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
    }

    .nlc-chatbot-bubble {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 12px;
      color: white;
      font-size: 14px;
      line-height: 1.5;
    }

    .nlc-chatbot-message.assistant .nlc-chatbot-bubble {
      background: rgba(38, 38, 38, 0.6);
      border: 1px solid #373535;
    }

    .nlc-chatbot-message.user .nlc-chatbot-bubble {
      background: rgba(59, 130, 246, 0.3);
      border: 1px solid rgba(59, 130, 246, 0.4);
    }

    .nlc-chatbot-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
    }

    .nlc-chatbot-typing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${config.primaryColor};
      animation: typing 1.4s infinite;
    }

    .nlc-chatbot-typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .nlc-chatbot-typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        opacity: 0.3;
        transform: translateY(0);
      }
      30% {
        opacity: 1;
        transform: translateY(-4px);
      }
    }

    .nlc-chatbot-input-container {
      padding: 16px;
      background: rgba(19, 19, 19, 0.6);
      border-top: 1px solid #373535;
      display: flex;
      gap: 12px;
    }

    .nlc-chatbot-input {
      flex: 1;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid #454444;
      border-radius: 8px;
      padding: 12px;
      color: white;
      font-size: 14px;
      outline: none;
    }

    .nlc-chatbot-input:focus {
      border-color: ${config.primaryColor};
    }

    .nlc-chatbot-send {
      background: linear-gradient(135deg, ${config.primaryColor} 0%, #B339D4 100%);
      border: none;
      border-radius: 8px;
      padding: 12px 16px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nlc-chatbot-send:hover {
      opacity: 0.9;
    }

    .nlc-chatbot-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 480px) {
      .nlc-chatbot-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 100px);
        bottom: 80px;
      }
    }
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create chatbot HTML
  const chatbotHTML = `
    <div class="nlc-chatbot-container ${config.position}">
      <button class="nlc-chatbot-button" id="nlc-toggle-btn">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM8.5 11C9.33 11 10 10.33 10 9.5C10 8.67 9.33 8 8.5 8C7.67 8 7 8.67 7 9.5C7 10.33 7.67 11 8.5 11ZM15.5 11C16.33 11 17 10.33 17 9.5C17 8.67 16.33 8 15.5 8C14.67 8 14 8.67 14 9.5C14 10.33 14.67 11 15.5 11ZM12 17.5C14.33 17.5 16.31 16.04 17.11 14H6.89C7.69 16.04 9.67 17.5 12 17.5Z"/>
        </svg>
      </button>

      <div class="nlc-chatbot-window" id="nlc-chat-window">
        <div class="nlc-chatbot-header">
          <h3>AI Coach Assistant</h3>
          <button class="nlc-chatbot-close" id="nlc-close-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="nlc-chatbot-messages" id="nlc-messages"></div>

        <div class="nlc-chatbot-input-container">
          <input
            type="text"
            class="nlc-chatbot-input"
            id="nlc-input"
            placeholder="Type your message..."
          />
          <button class="nlc-chatbot-send" id="nlc-send-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Insert chatbot into page
    const container = document.createElement('div');
    container.innerHTML = chatbotHTML;
    document.body.appendChild(container.firstElementChild);

    // Get elements
    const toggleBtn = document.getElementById('nlc-toggle-btn');
    const closeBtn = document.getElementById('nlc-close-btn');
    const chatWindow = document.getElementById('nlc-chat-window');
    const messagesContainer = document.getElementById('nlc-messages');
    const input = document.getElementById('nlc-input');
    const sendBtn = document.getElementById('nlc-send-btn');

    // State
    let threadID = null;
    let isLoading = false;

    // Event listeners
    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !isLoading) {
        sendMessage();
      }
    });

    function toggleChat() {
      chatWindow.classList.toggle('open');
      if (chatWindow.classList.contains('open') && !threadID) {
        initializeChat();
      }
    }

    function closeChat() {
      chatWindow.classList.remove('open');
    }

    async function initializeChat() {
      try {
        // Initialize thread (using Next.js proxy API)
        const response = await fetch(`${config.apiBaseURL}/api/agents/public/chat/coach/${config.coachID}/thread/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        threadID = data.data.threadID;
        console.log("Thread ID: ", threadID);

        // Add greeting message
        addMessage('assistant', config.greeting);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        addMessage('assistant', 'Sorry, I\'m having trouble connecting. Please try again later.');
      }
    }

    async function sendMessage() {
      console.log("Called");

      const message = input.value.trim();
      console.log("Message: ", message);
      console.log("Thread ID: ", threadID);
      if (!message || isLoading || !threadID) return;

      // Add user message to UI
      addMessage('user', message);
      input.value = '';

      // Show typing indicator
      const typingID = addTypingIndicator();
      isLoading = true;
      sendBtn.disabled = true;

      try {
        // Add message to thread
        await fetch(`${config.apiBaseURL}/api/agents/public/chat/coach/${config.coachID}/thread/${threadID}/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message })
        });

        // Run assistant
        const runResponse = await fetch(`${config.apiBaseURL}/api/agents/public/chat/coach/${config.coachID}/thread/${threadID}/run`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const runData = await runResponse.json();

        // Poll for completion
        let completed = false;
        let attempts = 0;

        while (!completed && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const statusResponse = await fetch(
            `${config.apiBaseURL}/api/agents/public/chat/coach/${config.coachID}/thread/${threadID}/run/${runData.data.runID}/status`
          );

          const statusData = await statusResponse.json();

          if (statusData.data.status === 'completed') {
            completed = true;

            // Get messages
            const messagesResponse = await fetch(
              `${config.apiBaseURL}/api/agents/public/chat/coach/${config.coachID}/thread/${threadID}/messages`
            );

            const messagesData = await messagesResponse.json();
            const assistantMessage = messagesData.data.messages[0].content[0].text.value;

            // Remove typing indicator and add response
            removeTypingIndicator(typingID);
            addMessage('assistant', assistantMessage);
          } else if (statusData.data.status === 'failed') {
            throw new Error('Assistant run failed');
          }

          attempts++;
        }

        if (!completed) {
          throw new Error('Request timed out');
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        removeTypingIndicator(typingID);
        addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      } finally {
        isLoading = false;
        sendBtn.disabled = false;
      }
    }

    function addMessage(role, content) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `nlc-chatbot-message ${role}`;

      const avatar = document.createElement('div');
      avatar.className = 'nlc-chatbot-avatar';
      avatar.innerHTML = role === 'assistant'
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';

      const bubble = document.createElement('div');
      bubble.className = 'nlc-chatbot-bubble';
      bubble.textContent = content;

      messageDiv.appendChild(avatar);
      messageDiv.appendChild(bubble);
      messagesContainer.appendChild(messageDiv);

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addTypingIndicator() {
      const typingID = 'typing-' + Date.now();
      const messageDiv = document.createElement('div');
      messageDiv.className = 'nlc-chatbot-message assistant';
      messageDiv.id = typingID;

      const avatar = document.createElement('div');
      avatar.className = 'nlc-chatbot-avatar';
      avatar.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';

      const bubble = document.createElement('div');
      bubble.className = 'nlc-chatbot-bubble';

      const typing = document.createElement('div');
      typing.className = 'nlc-chatbot-typing';
      typing.innerHTML = '<div class="nlc-chatbot-typing-dot"></div><div class="nlc-chatbot-typing-dot"></div><div class="nlc-chatbot-typing-dot"></div>';

      bubble.appendChild(typing);
      messageDiv.appendChild(avatar);
      messageDiv.appendChild(bubble);
      messagesContainer.appendChild(messageDiv);

      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      return typingID;
    }

    function removeTypingIndicator(typingID) {
      const typingElement = document.getElementById(typingID);
      if (typingElement) {
        typingElement.remove();
      }
    }
  }
})();
