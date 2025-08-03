// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');
const apiKeyInput = document.getElementById('api-key');
const saveKeyButton = document.getElementById('save-key');
const homepage = document.getElementById('homepage');
const chatContainer = document.getElementById('chat-container');
const createAiSection = document.getElementById('create-ai-section');
const freeApiSection = document.getElementById('free-api-section'); // Added this back if it was removed unintentionally
const contactSection = document.getElementById('contact-section');
const startChatButton = document.getElementById('start-chat-button');
const navLinks = document.querySelectorAll('.nav-link');
const mainContent = document.querySelector('.main-content');

// New AI Creation DOM Elements
const aiNameInput = document.getElementById('ai-name');
const aiPromptInput = document.getElementById('ai-prompt');
const saveAiButton = document.getElementById('save-ai-button');
const aiCharacterName = document.getElementById('ai-character-name');

// New elements for functionality
const newChatButton = document.getElementById('new-chat-button');
const chatHistorySections = document.getElementById('chat-history-sections'); // Get the container for history
// Removed: const actionButtons = document.querySelectorAll('.action-button'); // This element doesn't exist in index.html
const bulbHubLogo = document.querySelector('.company-name');
const searchIcon = document.querySelector('.search-icon');

// New DOM Elements for password toggle
const toggleApiKeyVisibility = document.getElementById('toggle-api-key-visibility');

// NEW: Header dropdown elements
const menuToggle = document.getElementById('menu-toggle');
const navDropdownMenu = document.getElementById('nav-dropdown-menu');


// Global variables for managing chat sessions
let chatSessions = []; // Array to store all chat sessions
let currentChatSessionId = null; // ID of the currently active chat session

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadChatSessions();
    if (chatSessions.length === 0) {
        startNewChatSession(); // Start a fresh chat if no history
    } else {
        // Load the last active session or the most recent one if no active
        const lastActiveSession = chatSessions.find(session => session.id === localStorage.getItem('last-active-chat-session'));
        if (lastActiveSession) {
            loadChatSession(lastActiveSession.id);
        } else {
            loadChatSession(chatSessions[0].id); // Load the first one by default
        }
    }
    renderChatHistorySidebar(); // Render sidebar after loading sessions
});


// Load API key from localStorage
const savedApiKey = localStorage.getItem('cohere-api-key');
if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
}

// Load AI Character from localStorage
const savedAiName = localStorage.getItem('ai-name');
const savedAiPrompt = localStorage.getItem('ai-prompt');
if (savedAiName) {
    aiNameInput.value = savedAiName;
    aiCharacterName.textContent = savedAiName; // Update display name
}
// Set a default character if none saved
if (!savedAiName) {
    aiCharacterName.textContent = "Alex"; // Default name if no AI character is set
}


// Event Listeners

// NEW: Toggle mobile menu
if (menuToggle) { // Check if menuToggle exists (it won't on larger screens with display:none)
    menuToggle.addEventListener('click', () => {
        navDropdownMenu.classList.toggle('show-menu');
    });
}


// Save API Key
saveKeyButton.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('cohere-api-key', key);
        alert('API Key saved successfully!');
    } else {
        alert('Please enter a valid API key.');
    }
});

// Event Listener for toggling API key visibility
if (toggleApiKeyVisibility) {
    toggleApiKeyVisibility.addEventListener('click', () => {
        const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
        apiKeyInput.setAttribute('type', type);
        // Toggle the icon
        toggleApiKeyVisibility.classList.toggle('fa-eye');
        toggleApiKeyVisibility.classList.toggle('fa-eye-slash');
    });
}

// Send Message
sendButton.addEventListener('click', () => {
    sendMessage();
});

userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // Prevent new line on Enter
        sendMessage();
    }
});

// Adjust textarea height dynamically
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
});

// Start Chatting Button
startChatButton.addEventListener('click', () => {
    showSection('chat-container');
    // NEW: Close dropdown menu if open after navigating
    if (navDropdownMenu.classList.contains('show-menu')) {
        navDropdownMenu.classList.remove('show-menu');
    }
});

// Navigation Links
navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const sectionId = event.target.dataset.section;
        showSection(sectionId);
        // NEW: Close dropdown menu after navigating
        if (navDropdownMenu.classList.contains('show-menu')) {
            navDropdownMenu.classList.remove('show-menu');
        }
    });
});

// Save AI Character
saveAiButton.addEventListener('click', (event) => {
    event.preventDefault();
    const name = aiNameInput.value.trim();
    const prompt = aiPromptInput.value.trim();

    if (name && prompt) {
        localStorage.setItem('ai-name', name);
        localStorage.setItem('ai-prompt', prompt);
        aiCharacterName.textContent = name; // Update the displayed AI character name
        alert('AI Character saved successfully!');
    } else {
        alert('Please enter both character name and personality prompt.');
    }
});

// --- Chat History and Session Management ---

// New Chat Button Functionality
newChatButton.addEventListener('click', startNewChatSession);

// BulbHub Logo (Company Name)
bulbHubLogo.addEventListener('click', () => {
    alert("Syntax Repo Home/Dashboard - Clicked!");
});

// Search Icon in Sidebar Header
searchIcon.addEventListener('click', () => {
    alert("Search chat history functionality is under development!");
});


// --- Core Functions ---

function showSection(sectionId) {
    document.querySelectorAll('.section-container').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function generateUniqueId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function loadChatSessions() {
    const storedSessions = localStorage.getItem('chatSessions');
    if (storedSessions) {
        chatSessions = JSON.parse(storedSessions);
    } else {
        chatSessions = [];
    }
}

function saveChatSessions() {
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    if (currentChatSessionId) {
        localStorage.setItem('last-active-chat-session', currentChatSessionId);
    }
}

function startNewChatSession() {
    const newId = generateUniqueId();
    currentChatSessionId = newId;
    const initialBotMessage = { role: 'bot', message: "Hello! I'm your AI assistant. How can I help you today?" };

    const newSession = {
        id: newId,
        title: 'New Chat', // Temporary title
        messages: [initialBotMessage],
        timestamp: Date.now() // For sorting/grouping later
    };
    chatSessions.unshift(newSession); // Add to the beginning
    saveChatSessions();
    
    chatMessages.innerHTML = ''; // Clear existing messages
    addBotMessage(initialBotMessage.message); // Display initial bot message
    userInput.value = ''; // Clear user input
    userInput.style.height = 'auto'; // Reset textarea height
    renderChatHistorySidebar();
}

function loadChatSession(sessionId) {
    const sessionToLoad = chatSessions.find(session => session.id === sessionId);
    if (!sessionToLoad) {
        console.error('Session not found:', sessionId);
        startNewChatSession(); // Fallback to new chat if session not found
        return;
    }

    currentChatSessionId = sessionId;
    saveChatSessions(); // Update last active session

    chatMessages.innerHTML = ''; // Clear current messages display
    sessionToLoad.messages.forEach(msg => {
        if (msg.role === 'user') {
            addUserMessage(msg.message);
        } else if (msg.role === 'bot') {
            addBotMessage(msg.message);
        }
    });
    userInput.value = ''; // Clear input
    userInput.style.height = 'auto'; // Reset textarea height
    renderChatHistorySidebar(); // Update active class in sidebar
    scrollToBottom();
}

function renderChatHistorySidebar() {
    chatHistorySections.innerHTML = ''; // Clear existing sidebar content

    if (chatSessions.length === 0) {
        // Display a message if no chats
        const noChatsDiv = document.createElement('div');
        noChatsDiv.classList.add('history-group');
        noChatsDiv.innerHTML = '<p style="text-align: center; color: var(--design-text-grey);">No recent chats.</p>';
        chatHistorySections.appendChild(noChatsDiv);
        return;
    }

    // Group chats by approximate time for better organization
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);


    const groups = {
        'Today': [],
        'Yesterday': [],
        'Last 3 days': [], // covers 2 and 3 days ago
        'Last 7 days': [], // covers 4-7 days ago
        'Last 30 days': [], // covers 8-30 days ago
        'Older': [] // anything older than 30 days
    };

    chatSessions.forEach(session => {
        // Check if it's an "empty" new chat session (title is 'New Chat' and only contains the initial bot message)
        const isNewEmptyChat = session.title === 'New Chat' && session.messages.length === 1 && session.messages[0].role === 'bot';

        // Only add to groups if it's not an empty new chat, OR it's the currently active session
        if (!isNewEmptyChat || session.id === currentChatSessionId) {
            const sessionDate = new Date(session.timestamp);

            if (sessionDate >= today) {
                groups['Today'].push(session);
            } else if (sessionDate >= yesterday) {
                groups['Yesterday'].push(session);
            } else if (sessionDate >= threeDaysAgo) {
                groups['Last 3 days'].push(session);
            } else if (sessionDate >= sevenDaysAgo) {
                groups['Last 7 days'].push(session);
            } else if (sessionDate >= thirtyDaysAgo) {
                groups['Last 30 days'].push(session);
            } else {
                groups['Older'].push(session);
            }
        }
    });

    for (const groupName in groups) {
        if (groups[groupName].length > 0) {
            const historyGroupDiv = document.createElement('div');
            historyGroupDiv.classList.add('history-group');

            const h4 = document.createElement('h4');
            h4.textContent = groupName;
            historyGroupDiv.appendChild(h4);

            const ul = document.createElement('ul');
            groups[groupName].forEach(session => {
                const li = document.createElement('li');
                li.classList.add('history-item');
                if (session.id === currentChatSessionId) {
                    li.classList.add('active');
                }
                li.dataset.sessionId = session.id;

                const sessionTitleSpan = document.createElement('span');
                sessionTitleSpan.textContent = session.title;
                sessionTitleSpan.classList.add('session-title-text');

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('delete-session-button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.dataset.sessionId = session.id;
                deleteButton.title = `Delete "${session.title}"`;
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // Prevent loading session when clicking delete
                    if (confirm(`Are you sure you want to delete the chat "${session.title}"?`)) {
                        deleteChatSession(session.id);
                    }
                });

                li.appendChild(sessionTitleSpan);
                li.appendChild(deleteButton);
                
                li.addEventListener('click', () => loadChatSession(session.id));
                ul.appendChild(li);
            });
            historyGroupDiv.appendChild(ul);
            chatHistorySections.appendChild(historyGroupDiv);
        }
    }
}

function deleteChatSession(sessionIdToDelete) {
    const wasCurrentSession = (sessionIdToDelete === currentChatSessionId);

    // Filter out the session to be deleted
    chatSessions = chatSessions.filter(session => session.id !== sessionIdToDelete);
    saveChatSessions(); // Save updated sessions to local storage

    if (wasCurrentSession) {
        // If the deleted session was the current one, start a new chat or load the most recent one
        if (chatSessions.length > 0) {
            loadChatSession(chatSessions[0].id); // Load the most recent session
        } else {
            startNewChatSession(); // No sessions left, start a brand new one
        }
    } else {
        // If a non-current session was deleted, just re-render the sidebar
        renderChatHistorySidebar();
    }
}

async function sendMessage() {
    const message = userInput.value.trim();
    const cohereApiKey = apiKeyInput.value.trim();
    const savedAiPrompt = localStorage.getItem('ai-prompt'); // Get the saved AI prompt

    if (!cohereApiKey) {
        alert('Please save your Cohere API key first!');
        return;
    }

    if (message === '') {
        return;
    }

    // Add user message to current session's history first
    const currentSession = chatSessions.find(session => session.id === currentChatSessionId);
    if (currentSession) {
        // If it's a new chat, set its title to the first user message
        if (currentSession.title === 'New Chat') {
            currentSession.title = message.substring(0, 30) + (message.length > 30 ? '...' : ''); // Truncate long titles
            renderChatHistorySidebar(); // Update sidebar with new title
        }
        currentSession.messages.push({ role: 'user', message: message });
        saveChatSessions(); // Save updated session
    }

    addUserMessage(message); // Display in chat UI
    userInput.value = ''; // Clear input after sending
    userInput.style.height = 'auto'; // Reset textarea height

    showTypingIndicator();

    try {
        const apiUrl = 'https://api.cohere.ai/v1/chat';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cohereApiKey}`,
        };

        // Prepare chat history for the API call from the current session
        const apiChatHistory = currentSession.messages.filter(msg => msg.role !== 'bot').map(msg => ({ // Cohere expects chat_history to be user/chatbot pairs
            role: msg.role === 'user' ? 'user' : 'chatbot', // Map 'bot' to 'chatbot' for Cohere
            message: msg.message
        }));
        // Remove the last user message from history sent to Cohere, as it's the current 'message'
        const lastUserMessage = apiChatHistory.pop();


        const data = {
            message: message, // This is the current message
            model: 'command-r', // Or 'command-r-plus' if you have access
            temperature: 0.7,
            chat_history: apiChatHistory, // Send the preceding history
            preamble: savedAiPrompt || "You are a helpful AI assistant. Provide concise and relevant answers." // Use saved prompt or default
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Cohere API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }

        const responseData = await response.json();
        const botResponse = responseData.text;

        // Add bot message to current session's history
        if (currentSession) {
            currentSession.messages.push({ role: 'bot', message: botResponse });
            saveChatSessions(); // Save updated session
        }
        addBotMessage(botResponse); // Display in chat UI

    } catch (error) {
        console.error('Error fetching from Cohere API:', error);
        const errorMessage = `Oops! Something went wrong. Please try again. Error: ${error.message}`;
        if (currentSession) {
            currentSession.messages.push({ role: 'bot', message: errorMessage });
            saveChatSessions();
        }
        addBotMessage(errorMessage);
    } finally {
        hideTypingIndicator();
    }
}

function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user-message');
    messageElement.innerHTML = `<div class=\"message-content\"><p>${message}</p></div>`;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

function addBotMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot-message');
    messageElement.innerHTML = `<div class=\"message-content\"><p>${message}</p></div>`;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
}

function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Dynamic Nebula Background Animation
const networkBackground = document.getElementById('network-background');
const particleCount = 20;

function createParticles() {
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 50 + 20; // Particles between 20px and 70px
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const animationDelay = Math.random() * 10; // Random delay for staggered animation

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}vw`;
        particle.style.top = `${y}vh`;
        particle.style.animationDelay = `${animationDelay}s`;

        networkBackground.appendChild(particle);
    }
}

createParticles(); // Initialize particles on page load
