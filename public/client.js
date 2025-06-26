const socket = io();
let currentUser = '';

// Get username with validation
function getUsername() {
  let username = '';
  while (!username || username.trim() === '') {
    username = prompt('Enter your name (3-15 characters):');
    if (username && username.trim().length > 15) {
      alert('Username must be 15 characters or less');
      username = '';
    }
    if (username && username.trim().length < 3) {
      alert('Username must be at least 3 characters');
      username = '';
    }
  }
  return username.trim();
}

// Format time
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Initialize chat
function initChat() {
  currentUser = getUsername();
  socket.emit('user joined', currentUser);
  document.getElementById('msg').focus();
}

// DOM elements
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('msg');
const messagesContainer = document.getElementById('messages');
const typingIndicator = document.getElementById('typing');
const userListContainer = document.getElementById('user-list');
const userCountElement = document.getElementById('user-count');

// Event listeners
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('chat message', {
      user: currentUser,
      text: message,
      time: new Date()
    });
    messageInput.value = '';
  }
});

messageInput.addEventListener('input', () => {
  if (messageInput.value.trim()) {
    socket.emit('typing', currentUser);
  } else {
    typingIndicator.textContent = '';
  }
});

// Socket event handlers
socket.on('chat message', (msg) => {
  typingIndicator.textContent = '';
  
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(msg.user === currentUser ? 'message-sent' : 'message-received');
  
  messageElement.innerHTML = `
    <div class="message-info">
      <span class="message-user">${msg.user}</span>
      <span class="message-time">${formatTime(new Date(msg.time))}</span>
    </div>
    <div class="message-text">${msg.text}</div>
  `;
  
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

socket.on('typing', (username) => {
  if (username !== currentUser) {
    typingIndicator.textContent = `${username} is typing...`;
    clearTimeout(typingIndicator.timeout);
    typingIndicator.timeout = setTimeout(() => {
      typingIndicator.textContent = '';
    }, 3000);
  }
});

socket.on('user list', (users) => {
  userCountElement.textContent = users.length;
  userListContainer.innerHTML = users
    .map(user => `<div>${user} ${user === currentUser ? '(You)' : ''}</div>`)
    .join('');
});

socket.on('user joined', (username) => {
  if (username !== currentUser) {
    const notification = document.createElement('div');
    notification.classList.add('message', 'notification');
    notification.textContent = `${username} joined the chat`;
    messagesContainer.appendChild(notification);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});

socket.on('user left', (username) => {
  const notification = document.createElement('div');
  notification.classList.add('message', 'notification');
  notification.textContent = `${username} left the chat`;
  messagesContainer.appendChild(notification);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Initialize the chat
initChat();