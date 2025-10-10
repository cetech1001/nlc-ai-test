(function() {
  'use strict';

  const scriptTag = document.currentScript;
  const coachID = scriptTag.getAttribute('data-coach-id');

  if (!coachID) {
    console.error('Next Level Coach AI Chatbot: data-coach-id attribute is required');
    return;
  }

  const config = {
    coachID: coachID,
    apiBaseURL: scriptTag.src.split('/embed/')[0],
    primaryColor: scriptTag.getAttribute('data-color') || '#DF69FF',
    position: scriptTag.getAttribute('data-position') || 'bottom-right',
    greeting: scriptTag.getAttribute('data-greeting') || 'Hi! How can I help you today?'
  };

  const SESSION_DURATION = 60 * 60 * 1000;
  const SESSION_KEY = 'nlc_chat_session_' + coachID;

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
      width: 420px;
      height: 650px;
      background: #0A0A0A;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      border: 1px solid #373535;
      display: none;
      flex-direction: column;
      overflow: hidden;
      position: relative;
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

    .nlc-chatbot-glow-left {
      position: absolute;
      left: -273px;
      top: -209px;
      width: 547px;
      height: 547px;
      border-radius: 50%;
      opacity: 0.2;
      background: linear-gradient(to right, #7B21BA, #E587FF, #7B21BA);
      filter: blur(112.55px);
      pointer-events: none;
      z-index: 0;
    }

    .nlc-chatbot-glow-right {
      position: absolute;
      right: -200px;
      bottom: -209px;
      width: 547px;
      height: 547px;
      border-radius: 50%;
      opacity: 0.2;
      background: linear-gradient(to left, #7B21BA, #E587FF, #7B26F0);
      filter: blur(112.55px);
      pointer-events: none;
      z-index: 0;
    }

    .nlc-chatbot-header {
      padding: 20px;
      background: linear-gradient(135deg, ${config.primaryColor} 0%, #B339D4 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1;
      position: relative;
    }

    .nlc-chatbot-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .nlc-chatbot-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .nlc-chatbot-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .nlc-chatbot-avatar-text {
      color: white;
      font-size: 18px;
      font-weight: bold;
    }

    .nlc-chatbot-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .nlc-chatbot-header p {
      margin: 0;
      font-size: 12px;
      opacity: 0.9;
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
      background: transparent;
      z-index: 1;
      position: relative;
    }

    .nlc-chatbot-messages::-webkit-scrollbar {
      width: 6px;
    }

    .nlc-chatbot-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .nlc-chatbot-messages::-webkit-scrollbar-thumb {
      background: #373535;
      border-radius: 3px;
    }

    .nlc-chatbot-message {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nlc-chatbot-message.user {
      align-items: flex-end;
    }

    .nlc-chatbot-message.assistant {
      align-items: flex-start;
    }

    .nlc-chatbot-message-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #C5C5C5;
    }

    .nlc-chatbot-message-dot {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: #D9D9D9;
    }

    .nlc-chatbot-bubble {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 10px;
      color: #C5C5C5;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .nlc-chatbot-message.assistant .nlc-chatbot-bubble {
      background: #1A1A1A;
    }

    .nlc-chatbot-message.user .nlc-chatbot-bubble {
      background: rgba(223, 105, 255, 0.08);
    }

    .nlc-chatbot-cursor {
      display: inline-block;
      width: 2px;
      height: 16px;
      background: #B339D4;
      margin-left: 2px;
      animation: blink 1s infinite;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    .nlc-chatbot-input-container {
      padding: 16px;
      background: transparent;
      border-top: 1px solid #373535;
      display: flex;
      gap: 12px;
      z-index: 1;
      position: relative;
    }

    .nlc-chatbot-input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 10px;
      padding: 8px 12px;
    }

    .nlc-chatbot-attachment-btn {
      background: #1B1511;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
    }

    .nlc-chatbot-attachment-btn svg {
      width: 14px;
      height: 14px;
      stroke: rgba(255, 255, 255, 0.5);
    }

    .nlc-chatbot-input {
      flex: 1;
      background: transparent;
      border: none;
      color: white;
      font-size: 14px;
      outline: none;
    }

    .nlc-chatbot-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .nlc-chatbot-send {
      background: linear-gradient(to right, #B339D4, #7B21BA, #7B26F0);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nlc-chatbot-send:hover {
      opacity: 0.9;
    }

    .nlc-chatbot-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .nlc-chatbot-send svg {
      width: 20px;
      height: 20px;
      fill: #F9F9F9;
    }

    @media (max-width: 480px) {
      .nlc-chatbot-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 100px);
        bottom: 80px;
      }
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  const chatbotHTML = `
    <div class="nlc-chatbot-container ${config.position}">
      <button class="nlc-chatbot-button" id="nlc-toggle-btn">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM8.5 11C9.33 11 10 10.33 10 9.5C10 8.67 9.33 8 8.5 8C7.67 8 7 8.67 7 9.5C7 10.33 7.67 11 8.5 11ZM15.5 11C16.33 11 17 10.33 17 9.5C17 8.67 16.33 8 15.5 8C14.67 8 14 8.67 14 9.5C14 10.33 14.67 11 15.5 11ZM12 17.5C14.33 17.5 16.31 16.04 17.11 14H6.89C7.69 16.04 9.67 17.5 12 17.5Z"/>
        </svg>
      </button>

      <div class="nlc-chatbot-window" id="nlc-chat-window">
        <div class="nlc-chatbot-glow-left"></div>
        <div class="nlc-chatbot-glow-right"></div>

        <div class="nlc-chatbot-header">
          <div class="nlc-chatbot-header-info">
            <div class="nlc-chatbot-avatar" id="nlc-avatar">
              <span class="nlc-chatbot-avatar-text">A</span>
            </div>
            <div>
              <h3 id="nlc-coach-name">AI Coach</h3>
              <p>Chat Assistant</p>
            </div>
          </div>
          <button class="nlc-chatbot-close" id="nlc-close-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="nlc-chatbot-messages" id="nlc-messages"></div>

        <div class="nlc-chatbot-input-container">
          <div class="nlc-chatbot-input-wrapper">
            <button class="nlc-chatbot-attachment-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <input
              type="text"
              class="nlc-chatbot-input"
              id="nlc-input"
              placeholder="Type your message..."
            />
          </div>
          <button class="nlc-chatbot-send" id="nlc-send-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const container = document.createElement('div');
    container.innerHTML = chatbotHTML;
    document.body.appendChild(container.firstElementChild);

    const toggleBtn = document.getElementById('nlc-toggle-btn');
    const closeBtn = document.getElementById('nlc-close-btn');
    const chatWindow = document.getElementById('nlc-chat-window');
    const messagesContainer = document.getElementById('nlc-messages');
    const input = document.getElementById('nlc-input');
    const sendBtn = document.getElementById('nlc-send-btn');
    const coachNameEl = document.getElementById('nlc-coach-name');
    const avatarEl = document.getElementById('nlc-avatar');

    let threadID = null;
    let isLoading = false;
    let coachName = 'Coach';
    let streamingMessageID = null;

    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !isLoading) {
        sendMessage();
      }
    });

    function getSessionThread() {
      try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (!stored) return null;

        const session = JSON.parse(stored);
        const now = Date.now();
        const age = now - session.createdAt;

        if (age > SESSION_DURATION) {
          sessionStorage.removeItem(SESSION_KEY);
          return null;
        }

        return session;
      } catch (err) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
    }

    function saveSessionThread(threadID) {
      const session = {
        threadID: threadID,
        createdAt: Date.now(),
        coachID: config.coachID
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

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
        const infoResponse = await fetch(`${config.apiBaseURL}/api/agents/public/chat/coach/${config.coachID}/info`);
        const infoData = await infoResponse.json();

        coachName = infoData.data.coachName;
        coachNameEl.textContent = coachName;

        const firstInitial = coachName.charAt(0).toUpperCase();
        avatarEl.querySelector('.nlc-chatbot-avatar-text').textContent = firstInitial;

        const existingSession = getSessionThread();
        let shouldLoadMessages = false;

        if (existingSession) {
          threadID = existingSession.threadID;
          shouldLoadMessages = true;
        } else {
          const response = await fetch(`${config.apiBaseURL}/api/agents/public/chat/coach/${config.coachID}/thread/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          threadID = data.data.threadID;
          saveSessionThread(threadID);
        }

        if (shouldLoadMessages) {
          const messagesResponse = await fetch(
            `${config.apiBaseURL}/api/agents/public/chat/coach/${config.coachID}/thread/${threadID}/messages`
          );
          const messagesData = await messagesResponse.json();

          if (messagesData.data && messagesData.data.length > 0) {
            messagesData.data.forEach(msg => {
              addMessage(msg.role, msg.content, new Date(msg.createdAt));
            });
          } else {
            showGreeting();
          }
        } else {
          showGreeting();
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        addMessage('assistant', 'Sorry, I\'m having trouble connecting. Please try again later.');
      }
    }

    function showGreeting() {
      addMessage('assistant', `Hey! How's everything going with your program?\nLet me know if you need any help today!`);
    }

    async function sendMessage() {
      const message = input.value.trim();
      if (!message || isLoading || !threadID) return;

      addMessage('user', message);
      input.value = '';

      isLoading = true;
      sendBtn.disabled = true;

      streamingMessageID = 'msg-' + Date.now();
      const messageEl = addMessage('assistant', '', null, true);

      try {
        const response = await fetch(
          `${config.apiBaseURL}/api/agents/public/chat/coach/${config.coachID}/thread/${threadID}/stream`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
          }
        );

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content') {
                  fullContent += parsed.content;
                  updateMessageContent(messageEl, fullContent, true);
                } else if (parsed.type === 'done') {
                  updateMessageContent(messageEl, parsed.fullContent, false);
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        updateMessageContent(messageEl, 'Sorry, I encountered an error. Please try again.', false);
      } finally {
        isLoading = false;
        sendBtn.disabled = false;
        streamingMessageID = null;
      }
    }

    function addMessage(role, content, timestamp = null, isStreaming = false) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `nlc-chatbot-message ${role}`;
      messageDiv.dataset.messageID = isStreaming ? streamingMessageID : ('msg-' + Date.now());

      const time = timestamp || new Date();
      const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const headerDiv = document.createElement('div');
      headerDiv.className = 'nlc-chatbot-message-header';
      headerDiv.innerHTML = `
        <span>${role === 'assistant' ? coachName : 'You'}</span>
        <div class="nlc-chatbot-message-dot"></div>
        <span>${timeStr}</span>
      `;

      const bubble = document.createElement('div');
      bubble.className = 'nlc-chatbot-bubble';
      bubble.textContent = content;

      if (isStreaming) {
        const cursor = document.createElement('span');
        cursor.className = 'nlc-chatbot-cursor';
        bubble.appendChild(cursor);
      }

      messageDiv.appendChild(headerDiv);
      messageDiv.appendChild(bubble);
      messagesContainer.appendChild(messageDiv);

      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      return messageDiv;
    }

    function updateMessageContent(messageEl, content, isStreaming) {
      const bubble = messageEl.querySelector('.nlc-chatbot-bubble');
      bubble.textContent = content;

      if (isStreaming) {
        const cursor = document.createElement('span');
        cursor.className = 'nlc-chatbot-cursor';
        bubble.appendChild(cursor);
      }

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
})();
