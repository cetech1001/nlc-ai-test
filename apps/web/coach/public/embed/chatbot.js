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
    apiBaseURL: scriptTag.src.split('/embed/')[0]
  };

  const SESSION_DURATION = 60 * 60 * 1000;
  const SESSION_KEY = 'nlc_chat_session_' + coachID;
  const USER_INFO_KEY = 'nlc_user_info_' + coachID;

  let customization = null;

  const baseStyles = `
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
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
      z-index: 2;
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
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      border: 1px solid #373535;
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 1;
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
      filter: blur(112.55px);
      pointer-events: none;
      z-index: 0;
    }

    .nlc-chatbot-header {
      padding: 20px;
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
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
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
      background: #B339D4;
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
        transform: translateY(0);
        opacity: 0.7;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
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

    .nlc-user-info-form {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      z-index: 1;
      position: relative;
    }

    .nlc-form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nlc-form-label {
      font-size: 13px;
      font-weight: 500;
    }

    .nlc-form-input {
      padding: 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(0, 0, 0, 0.3);
      color: white;
      font-size: 14px;
      outline: none;
    }

    .nlc-form-input:focus {
      border-color: #B339D4;
    }

    .nlc-form-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .nlc-form-error {
      color: #ff6b6b;
      font-size: 12px;
      margin-top: 4px;
    }

    .nlc-form-submit {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .nlc-form-submit:hover {
      opacity: 0.9;
    }

    .nlc-form-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .nlc-form-checkbox-group {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .nlc-form-checkbox {
      width: 18px;
      height: 18px;
      margin-top: 2px;
      cursor: pointer;
      accent-color: #B339D4;
    }

    .nlc-form-checkbox-label {
      font-size: 12px;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
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
  styleSheet.textContent = baseStyles;
  document.head.appendChild(styleSheet);

  const chatbotHTML = `
    <div class="nlc-chatbot-container">
      <button class="nlc-chatbot-button" id="nlc-toggle-btn">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16ZM7 9H9V11H7V9ZM11 9H13V11H11V9ZM15 9H17V11H15V9Z"/>
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

        <div id="nlc-user-info-container" style="display: none;">
          <form class="nlc-user-info-form" id="nlc-user-info-form">
            <div class="nlc-form-group">
              <label class="nlc-form-label" id="nlc-name-label">Name *</label>
              <input type="text" class="nlc-form-input" id="nlc-name-input" placeholder="Enter your name" />
              <span class="nlc-form-error" id="nlc-name-error"></span>
            </div>
            <div class="nlc-form-group" id="nlc-email-group">
              <label class="nlc-form-label" id="nlc-email-label">Email *</label>
              <input type="email" class="nlc-form-input" id="nlc-email-input" placeholder="Enter your email" />
              <span class="nlc-form-error" id="nlc-email-error"></span>
            </div>
            <div class="nlc-form-group" id="nlc-phone-group">
              <label class="nlc-form-label" id="nlc-phone-label">Phone *</label>
              <input type="tel" class="nlc-form-input" id="nlc-phone-input" placeholder="Enter your phone" />
              <span class="nlc-form-error" id="nlc-phone-error"></span>
            </div>
            <div class="nlc-form-checkbox-group">
              <input type="checkbox" class="nlc-form-checkbox" id="nlc-marketing-optin" />
              <label class="nlc-form-checkbox-label" for="nlc-marketing-optin">
                I agree to receive marketing communications and updates
              </label>
            </div>
            <button type="submit" class="nlc-form-submit" id="nlc-form-submit">Start Chat</button>
          </form>
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

  async function init() {
    try {
      await loadCustomization();
      initializeUI();
    } catch (error) {
      console.error('Failed to initialize chatbot:', error);
    }
  }

  async function loadCustomization() {
    try {
      const response = await fetch(`${config.apiBaseURL}/api/users/chatbot-customization/public/${config.coachID}`);
      const data = await response.json();
      customization = data.data || data;
    } catch (error) {
      console.error('Failed to load customization:', error);
      customization = getDefaultCustomization();
    }
  }

  function getDefaultCustomization() {
    return {
      name: 'AI Coach',
      primaryColor: '#DF69FF',
      gradientStart: '#B339D4',
      gradientEnd: '#7B21BA',
      assistantTextColor: '#C5C5C5',
      assistantBubbleColor: '#1A1A1A',
      userTextColor: '#C5C5C5',
      userBubbleColor: 'rgba(223,105,255,0.08)',
      backgroundColor: '#0A0A0A',
      glowColor: '#7B21BA',
      position: 'bottom-right',
      greeting: "Hey! How's everything going with your program?\nLet me know if you need any help today!",
      requireUserInfo: false,
      requireName: false,
      requireEmail: false,
      requirePhone: false
    };
  }

  function initializeUI() {
    const container = document.createElement('div');
    container.innerHTML = chatbotHTML;
    document.body.appendChild(container.firstElementChild);

    applyCustomization();

    const toggleBtn = document.getElementById('nlc-toggle-btn');
    const closeBtn = document.getElementById('nlc-close-btn');
    const chatWindow = document.getElementById('nlc-chat-window');
    const messagesContainer = document.getElementById('nlc-messages');
    const input = document.getElementById('nlc-input');
    const sendBtn = document.getElementById('nlc-send-btn');
    const coachNameEl = document.getElementById('nlc-coach-name');
    const avatarEl = document.getElementById('nlc-avatar');
    const userInfoForm = document.getElementById('nlc-user-info-form');
    const userInfoContainer = document.getElementById('nlc-user-info-container');

    let threadID = null;
    let isLoading = false;
    let coachName = customization.name;
    let streamingMessageID = null;
    let showTypingIndicator = false;

    coachNameEl.textContent = coachName;
    const firstInitial = coachName.charAt(0).toUpperCase();
    avatarEl.querySelector('.nlc-chatbot-avatar-text').textContent = firstInitial;

    if (customization.avatarUrl) {
      avatarEl.innerHTML = `<img src="${customization.avatarUrl}" alt="${coachName}" />`;
    }

    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', closeChat);
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !isLoading) {
        sendMessage();
      }
    });

    if (userInfoForm) {
      userInfoForm.addEventListener('submit', handleUserInfoSubmit);
    }

    function applyCustomization() {
      const chatbotContainer = document.querySelector('.nlc-chatbot-container');
      if (chatbotContainer) {
        chatbotContainer.className = `nlc-chatbot-container ${customization.position}`;
      }

      const style = document.createElement('style');
      style.textContent = `
        .nlc-chatbot-button {
          background: linear-gradient(135deg, ${customization.primaryColor} 0%, ${customization.gradientStart} 100%) !important;
        }
        .nlc-chatbot-window {
          background: ${customization.backgroundColor} !important;
        }
        .nlc-chatbot-header {
          background: linear-gradient(135deg, ${customization.primaryColor} 0%, ${customization.gradientStart} 100%) !important;
        }
        .nlc-chatbot-glow-left {
          background: linear-gradient(to right, ${customization.glowColor}, ${customization.primaryColor}, ${customization.glowColor}) !important;
        }
        .nlc-chatbot-glow-right {
          background: linear-gradient(to left, ${customization.glowColor}, ${customization.primaryColor}, ${customization.glowColor}) !important;
        }
        .nlc-chatbot-message.assistant .nlc-chatbot-bubble {
          background: ${customization.assistantBubbleColor} !important;
          color: ${customization.assistantTextColor} !important;
        }
        .nlc-chatbot-message.user .nlc-chatbot-bubble {
          background: ${customization.userBubbleColor} !important;
          color: ${customization.userTextColor} !important;
        }
        .nlc-chatbot-message-header {
          color: ${customization.assistantTextColor} !important;
        }
        .nlc-chatbot-send {
          background: linear-gradient(to right, ${customization.gradientStart}, ${customization.gradientEnd}, ${customization.primaryColor}) !important;
        }
        .nlc-form-label {
          color: ${customization.assistantTextColor} !important;
        }
        .nlc-form-submit {
          background: linear-gradient(to right, ${customization.gradientStart}, ${customization.gradientEnd}, ${customization.primaryColor}) !important;
        }
      `;
      document.head.appendChild(style);
    }

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

    function getUserInfo() {
      try {
        const stored = sessionStorage.getItem(USER_INFO_KEY);
        return stored ? JSON.parse(stored) : null;
      } catch (err) {
        return null;
      }
    }

    function saveUserInfo(info) {
      sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
    }

    function toggleChat() {
      const isOpen = chatWindow.classList.contains('open');

      if (!isOpen) {
        chatWindow.classList.add('open');

        if (!threadID) {
          if (customization.requireUserInfo) {
            const userInfo = getUserInfo();
            if (!userInfo) {
              showUserInfoForm();
              return;
            }
          }
          initializeChat();
        }
      } else {
        chatWindow.classList.remove('open');
      }
    }

    function closeChat() {
      chatWindow.classList.remove('open');
    }

    function showUserInfoForm() {
      messagesContainer.style.display = 'none';
      document.querySelector('.nlc-chatbot-input-container').style.display = 'none';
      userInfoContainer.style.display = 'block';

      if (!customization.requireEmail) {
        document.getElementById('nlc-email-group').style.display = 'none';
      }
      if (!customization.requirePhone) {
        document.getElementById('nlc-phone-group').style.display = 'none';
      }
    }

    function hideUserInfoForm() {
      messagesContainer.style.display = 'block';
      document.querySelector('.nlc-chatbot-input-container').style.display = 'flex';
      userInfoContainer.style.display = 'none';
    }

    async function handleUserInfoSubmit(e) {
      e.preventDefault();

      document.getElementById('nlc-name-error').textContent = '';
      document.getElementById('nlc-email-error').textContent = '';
      document.getElementById('nlc-phone-error').textContent = '';

      const name = document.getElementById('nlc-name-input').value.trim();
      const email = document.getElementById('nlc-email-input').value.trim();
      const phone = document.getElementById('nlc-phone-input').value.trim();
      const marketingOptIn = document.getElementById('nlc-marketing-optin').checked;

      let hasError = false;

      if (customization.requireName && !name) {
        document.getElementById('nlc-name-error').textContent = 'Name is required';
        hasError = true;
      }

      if (customization.requireEmail) {
        if (!email) {
          document.getElementById('nlc-email-error').textContent = 'Email is required';
          hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          document.getElementById('nlc-email-error').textContent = 'Invalid email address';
          hasError = true;
        }
      }

      if (customization.requirePhone && !phone) {
        document.getElementById('nlc-phone-error').textContent = 'Phone is required';
        hasError = true;
      }

      if (hasError) return;

      const userInfo = {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        marketingOptIn: marketingOptIn
      };

      saveUserInfo(userInfo);

      // Disable form while submitting
      document.getElementById('nlc-form-submit').disabled = true;

      try {
        // Create thread first
        const threadResponse = await fetch(`${config.apiBaseURL}/api/agents/public/chat/coach/${config.coachID}/thread/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const threadData = await threadResponse.json();
        threadID = threadData.data.threadID;
        saveSessionThread(threadID);

        // Submit lead to API
        await fetch(`${config.apiBaseURL}/api/leads/chatbot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coachID: config.coachID,
            threadID: threadData.data.agentThreadID,
            name: userInfo.name,
            email: userInfo.email,
            phone: userInfo.phone,
            marketingOptIn: userInfo.marketingOptIn
          })
        });

        hideUserInfoForm();
        await initializeChat();
      } catch (error) {
        console.error('Failed to submit user info:', error);
        document.getElementById('nlc-name-error').textContent = 'Failed to start chat. Please try again.';
        document.getElementById('nlc-form-submit').disabled = false;
      }
    }

    async function initializeChat() {
      try {
        const existingSession = getSessionThread();
        let shouldLoadMessages = false;

        if (existingSession) {
          threadID = existingSession.threadID;
          shouldLoadMessages = true;
        } else if (!threadID) {
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
      addMessage('assistant', customization.greeting || "Hey! How's everything going with your program?\nLet me know if you need any help today!");
    }

    async function sendMessage() {
      const message = input.value.trim();
      if (!message || isLoading || !threadID) return;

      addMessage('user', message);
      input.value = '';

      isLoading = true;
      sendBtn.disabled = true;

      streamingMessageID = 'msg-' + Date.now();
      showTypingIndicator = true;
      const messageEl = addTypingIndicator();

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
        let firstContentReceived = false;

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
                  if (!firstContentReceived) {
                    removeTypingIndicator(messageEl);
                    const newMessageEl = addMessage('assistant', '', null, true);
                    messageEl.replaceWith(newMessageEl);
                    firstContentReceived = true;
                    fullContent += parsed.content;
                    updateMessageContent(newMessageEl, fullContent, true);
                  } else {
                    fullContent += parsed.content;
                    const existingMsg = messagesContainer.querySelector(`[data-message-id="${streamingMessageID}"]`);
                    if (existingMsg) {
                      updateMessageContent(existingMsg, fullContent, true);
                    }
                  }
                } else if (parsed.type === 'done') {
                  const existingMsg = messagesContainer.querySelector(`[data-message-id="${streamingMessageID}"]`);
                  if (existingMsg) {
                    updateMessageContent(existingMsg, parsed.fullContent, false);
                  }
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        removeTypingIndicator(messageEl);
        addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      } finally {
        isLoading = false;
        sendBtn.disabled = false;
        streamingMessageID = null;
        showTypingIndicator = false;
      }
    }

    function addTypingIndicator() {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'nlc-chatbot-message assistant';
      messageDiv.dataset.messageID = streamingMessageID;

      const time = new Date();
      const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const headerDiv = document.createElement('div');
      headerDiv.className = 'nlc-chatbot-message-header';
      headerDiv.innerHTML = `
        <span>${coachName}</span>
        <div class="nlc-chatbot-message-dot"></div>
        <span>${timeStr}</span>
      `;

      const bubble = document.createElement('div');
      bubble.className = 'nlc-chatbot-bubble';
      bubble.innerHTML = `
        <div class="nlc-chatbot-typing">
          <div class="nlc-chatbot-typing-dot"></div>
          <div class="nlc-chatbot-typing-dot"></div>
          <div class="nlc-chatbot-typing-dot"></div>
        </div>
      `;

      messageDiv.appendChild(headerDiv);
      messageDiv.appendChild(bubble);
      messagesContainer.appendChild(messageDiv);

      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      return messageDiv;
    }

    function removeTypingIndicator(messageEl) {
      if (messageEl && messageEl.parentNode) {
        messageEl.remove();
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

      messageDiv.appendChild(headerDiv);
      messageDiv.appendChild(bubble);
      messagesContainer.appendChild(messageDiv);

      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      return messageDiv;
    }

    function updateMessageContent(messageEl, content, isStreaming) {
      const bubble = messageEl.querySelector('.nlc-chatbot-bubble');
      bubble.textContent = content;

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
})();
