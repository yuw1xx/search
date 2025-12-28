// ELEMENTS
const outline = document.querySelector('.cursor-outline');
const searchInput = document.getElementById('search-input');
const searchForm = document.getElementById('search-form');
const engineNameDisplay = document.getElementById('current-engine-name');
const engineMenu = document.getElementById('engine-menu');
const settingsMenu = document.getElementById('settings-menu');

let activeEngineUrl = 'https://www.google.com/search?q=';

// - - -

// ENGINE DETECTION & PERSISTANCE
const getPreferredEngine = () => {
    // Check if user previously saved a choice
    const savedEngineName = localStorage.getItem('preferredEngineName');
    const savedEngineUrl = localStorage.getItem('preferredEngineUrl');

    if (savedEngineName && savedEngineUrl) {
        return { name: savedEngineName, url: savedEngineUrl }; //
    }

    // Fallback to auto-detection if no save exists
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('duckduckgo')) return { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' };
        if (ua.includes('brave')) return { name: 'Brave Search', url: 'https://search.brave.com/search?q=' };
            return { name: 'Google', url: 'https://www.google.com/search?q=' };
};

const detected = getPreferredEngine();
if (engineNameDisplay) engineNameDisplay.innerText = detected.name;
activeEngineUrl = detected.url;

// - - -

// UI INTERACTIONS
document.getElementById('engine-trigger')?.addEventListener('click', (e) => {
    e.stopPropagation();
    engineMenu.classList.toggle('hidden');
    settingsMenu.classList.add('hidden');
});

document.getElementById('settings-trigger')?.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle('hidden');
    engineMenu.classList.add('hidden');
});

// Assign engine AND save to localStorage
document.querySelectorAll('.engine-option').forEach(option => {
    option.addEventListener('click', (e) => {
        const url = option.getAttribute('data-url');
        const name = option.getAttribute('data-engine');

        if (url && name) {
            // Update UI and Variable
            activeEngineUrl = url;
            engineNameDisplay.innerText = name;

            // SAVE to localStorage so it is remembered on refresh
            localStorage.setItem('preferredEngineName', name);
            localStorage.setItem('preferredEngineUrl', url);

            engineMenu.classList.add('hidden');
        }
    });
});

window.addEventListener('click', () => {
    engineMenu.classList.add('hidden');
    settingsMenu.classList.add('hidden');
});

// - - -

// CUSTOM CURSOR LOGIC
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
const speed = 0.16; // Adjust for "weight"

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    // Smooth trailing logic
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;

    outline.style.left = `${cursorX}px`;
    outline.style.top = `${cursorY}px`;

    requestAnimationFrame(animateCursor);
}
animateCursor();

/* --- Interaction States --- */
window.addEventListener('mousedown', () => document.body.classList.add('cursor-clicking'));
window.addEventListener('mouseup', () => document.body.classList.remove('cursor-clicking'));

// Catch-all hover detection for all interactive elements
document.addEventListener('mouseover', (e) => {
    // Covers: Links, Buttons, Inputs, Engine options, Shortcut items, and Settings
    if (e.target.closest('a, button, input, .engine-option, .shortcut-item, .settings-btn, #engine-trigger')) {
        document.body.classList.add('cursor-active');
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, input, .engine-option, .shortcut-item, .settings-btn, #engine-trigger')) {
        document.body.classList.remove('cursor-active');
    }
});

// - - -

// SEARCH EXECUTION
searchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) window.location.href = activeEngineUrl + encodeURIComponent(query);
});

// - - -

// CLOCK LOGIC
function tick() {
    const now = new Date();
    const s = now.getSeconds(), m = now.getMinutes(), h = now.getHours();

    const sHand = document.getElementById('second-hand');
    const mHand = document.getElementById('minute-hand');
    const hHand = document.getElementById('hour-hand');
    const digital = document.getElementById('digital-clock');

    if (sHand) sHand.style.transform = `rotate(${(s/60)*360}deg)`;
    if (mHand) mHand.style.transform = `rotate(${(m/60)*360 + (s/60)*6}deg)`;
    if (hHand) hHand.style.transform = `rotate(${(h%12/12)*360 + (m/60)*30}deg)`;
    if (digital) digital.innerText = now.toLocaleTimeString('en-GB');
}
setInterval(tick, 1000);
tick();

// Add this to your UI Interactions section
document.querySelectorAll('.settings-menu .engine-option').forEach(option => {
    option.addEventListener('click', (e) => {
        // Determine which clock to set based on the text content
        const type = option.innerText.toLowerCase().includes('analog') ? 'analog' : 'digital';
        window.setClock(type);

        // Close the menu after selecting
        settingsMenu.classList.add('hidden');
    });
});

// - - -

// CLOCK SWAPPING LOGIC
window.setClock = (type) => {
    const analog = document.getElementById('analog-clock');
    const digital = document.getElementById('digital-clock');

    if (type === 'analog') {
        digital.classList.remove('clock-active');
        analog.classList.add('clock-active');
    } else {
        analog.classList.remove('clock-active');
        digital.classList.add('clock-active');
    }

    // Save the selection to localStorage
    localStorage.setItem('preferredClock', type);
};

// --- Initialization (Add this near the top or bottom of your file) ---
document.addEventListener('DOMContentLoaded', () => {
    // Load the saved clock or default to 'analog'
    const savedClock = localStorage.getItem('preferredClock') || 'analog';
    window.setClock(savedClock);

    // Re-run initial render for shortcuts
    renderShortcuts();
});

// - - -

// SHORTCUTS
const iconLibrary = {
    web: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    github: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    reddit: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M17 13c-1 1-3 1-4-1-1 2-3 2-4 1"/><line x1="16" y1="9" x2="16" y2="9.01"/><line x1="9" y1="9" x2="9" y2="9.01"/></svg>',
    twitch: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"/></svg>',
    code: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
};

let shortcuts = JSON.parse(localStorage.getItem('myShortcuts')) || [];
let currentEditId = null;
let selectedIconId = 'web';
let activeHoverIndex = null;

const modal = document.getElementById('shortcut-modal');
const bar = document.getElementById('shortcuts-bar');
const actionPopup = document.getElementById('shortcut-actions');

function renderShortcuts() {
    const addBtn = document.getElementById('open-shortcut-modal');
    const items = bar.querySelectorAll('.shortcut-item');
    items.forEach(i => i.remove());

    shortcuts.forEach((s, index) => {
        const item = document.createElement('div');
        item.className = 'shortcut-item';
        item.innerHTML = iconLibrary[s.icon] || iconLibrary['web'];
        item.title = s.name;

        // Hover Logic: Attach the popup to the current item
        item.onmouseenter = () => {
            activeHoverIndex = index;
            item.appendChild(actionPopup);
            actionPopup.classList.remove('hidden');
        };

        item.onmouseleave = (e) => {
            // FIX: Only hide if the mouse is NOT moving into the popup buttons
            const movingToPopup = e.relatedTarget && actionPopup.contains(e.relatedTarget);
            if (!movingToPopup) {
                actionPopup.classList.add('hidden');
            }
        };

        actionPopup.onmouseleave = (e) => {
            // Check if we are moving back to the shortcut icon itself
            const movingToItem = e.relatedTarget && e.relatedTarget.closest('.shortcut-item');
            if (!movingToItem) {
                actionPopup.classList.add('hidden');
            }
        };

        item.onclick = (e) => {
            // Only navigate if we didn't click the popup buttons
            if (!actionPopup.contains(e.target)) {
                window.location.href = s.url;
            }
        };

        bar.insertBefore(item, addBtn);
    });
}

function renderIconSelector() {
    const grid = document.getElementById('icon-grid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.entries(iconLibrary).forEach(([key, svg]) => {
        const opt = document.createElement('div');
        opt.className = `icon-option ${key === selectedIconId ? 'selected' : ''}`;
        opt.innerHTML = svg;
        opt.onclick = () => {
            selectedIconId = key;
            renderIconSelector();
        };
        grid.appendChild(opt);
    });
}

function openModal(index = null) {
    currentEditId = index;
    modal.classList.remove('hidden');
    actionPopup.classList.add('hidden'); // Hide popup when modal opens

    if (index !== null) {
        document.getElementById('shortcut-name').value = shortcuts[index].name;
        document.getElementById('shortcut-url').value = shortcuts[index].url;
        selectedIconId = shortcuts[index].icon;
    } else {
        document.getElementById('shortcut-name').value = '';
        document.getElementById('shortcut-url').value = '';
        selectedIconId = 'web';
    }
    renderIconSelector();
}

// Global delegated click for the "+" button
document.addEventListener('click', (e) => {
    if (e.target.closest('#open-shortcut-modal')) openModal();
});

document.getElementById('close-modal').onclick = () => modal.classList.add('hidden');

// Popup Action: Edit
actionPopup.querySelector('.edit-btn').onclick = (e) => {
    e.stopPropagation();
    openModal(activeHoverIndex);
};

// Popup Action: Delete
actionPopup.querySelector('.delete-btn').onclick = (e) => {
    e.stopPropagation();
    shortcuts.splice(activeHoverIndex, 1);
    localStorage.setItem('myShortcuts', JSON.stringify(shortcuts));
    actionPopup.classList.add('hidden');
    renderShortcuts();
};

document.getElementById('save-shortcut').onclick = () => {
    const name = document.getElementById('shortcut-name').value.trim();
    let url = document.getElementById('shortcut-url').value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

        const data = { name, url, icon: selectedIconId };
    if (currentEditId !== null) shortcuts[currentEditId] = data;
    else shortcuts.push(data);

    localStorage.setItem('myShortcuts', JSON.stringify(shortcuts));
    modal.classList.add('hidden');
    renderShortcuts();
};

// Initialization
renderShortcuts();
